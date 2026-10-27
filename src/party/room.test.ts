import { describe, expect, it } from 'vitest'
import { countingGame } from '@/test/counting-game'
import type { AnyGameRules } from './game-rules'
import { seededRandom } from './random'
import {
  changeSettings,
  endGame,
  isExpired,
  isProblem,
  joinAsPlayer,
  leaveRoom,
  makeMove,
  MAX_PEOPLE,
  nextWakeAt,
  openRoom,
  playAgain,
  ROOM_LIFETIME_MS,
  startGame,
  viewRoom,
  type JoinResult,
  type RoomResult,
  type RoomState,
} from './room'

const rules = countingGame as AnyGameRules
const context = (now = 1000) => ({ rules, random: seededRandom(7), now })
const nobodyConnected = { connectedPlayerIds: new Set<string>(), tableScreens: 0 }

function roomOf(result: RoomResult | JoinResult): RoomState {
  if (isProblem(result as RoomResult)) throw new Error(`unexpected problem ${JSON.stringify(result)}`)
  return (result as { room: RoomState }).room
}

function newRoom(): RoomState {
  return roomOf(openRoom('KWPF', { target: 5 }, context()))
}

function withPlayers(names: string[]): { room: RoomState; ids: string[]; tokens: string[] } {
  let room = newRoom()
  const ids: string[] = []
  const tokens: string[] = []
  names.forEach((name, index) => {
    const joined = joinAsPlayer(
      room,
      { name, seatToken: null },
      { ...context(2000 + index), random: seededRandom(index) },
    )
    if ('problem' in joined) throw new Error('join failed')
    room = joined.room
    ids.push(joined.player.id)
    tokens.push(joined.player.seatToken)
  })
  return { room, ids, tokens }
}

describe('opening a room', () => {
  it('refuses settings the game does not allow', () => {
    expect(openRoom('KWPF', { target: 99 }, context())).toEqual({
      problem: { from: 'room', code: 'badSettings', args: [] },
    })
  })

  it('uses the game defaults when no settings are given', () => {
    expect(roomOf(openRoom('KWPF', undefined, context())).settings).toEqual({ target: 5 })
  })
})

describe('joining', () => {
  it('gives each new phone its own player and token', () => {
    const { room, ids, tokens } = withPlayers(['Anna', 'Bram'])

    expect(room.players.map((player) => player.name)).toEqual(['Anna', 'Bram'])
    expect(new Set(ids).size).toBe(2)
    expect(tokens.every((token) => /^[0-9a-f]{32}$/.test(token))).toBe(true)
  })

  it('puts a returning phone back as the same player, with the name it sends now', () => {
    const { room, ids, tokens } = withPlayers(['Anna', 'Bram'])

    const again = joinAsPlayer(room, { name: 'Anneke', seatToken: tokens[0] }, context())

    expect('player' in again && again.player.id).toBe(ids[0])
    expect(roomOf(again).players.map((player) => player.name)).toEqual(['Anneke', 'Bram'])
  })

  it('treats an unknown token as someone new', () => {
    const { room } = withPlayers(['Anna'])

    const joined = joinAsPlayer(room, { name: 'Bram', seatToken: 'f'.repeat(32) }, context())

    expect(roomOf(joined).players).toHaveLength(2)
  })

  it('refuses a name that is only spaces', () => {
    expect(joinAsPlayer(newRoom(), { name: '   ', seatToken: null }, context())).toEqual({
      problem: { from: 'room', code: 'nameMissing', args: [] },
    })
  })

  it('refuses anyone once the room is full', () => {
    const { room } = withPlayers(Array.from({ length: MAX_PEOPLE }, (_, index) => `P${index}`))

    expect(joinAsPlayer(room, { name: 'Late', seatToken: null }, context())).toEqual({
      problem: { from: 'room', code: 'roomFull', args: [] },
    })
  })
})

describe('starting', () => {
  it('needs the game minimum of players', () => {
    const { room, ids } = withPlayers(['Anna'])

    expect(startGame(room, { as: 'player', playerId: ids[0] }, context())).toEqual({
      problem: { from: 'room', code: 'tooFewPlayers', args: [2] },
    })
  })

  it('seats the first to join, up to the game maximum, and lets the rest watch', () => {
    const { room, ids } = withPlayers(['Anna', 'Bram', 'Cas', 'Dirk'])

    const started = roomOf(startGame(room, { as: 'table' }, context()))

    expect(started.seats).toEqual(ids.slice(0, 3))
    expect(viewRoom(started, { as: 'player', playerId: ids[3] }, nobodyConnected, rules).me).toEqual({
      playerId: ids[3],
      seat: null,
    })
  })

  it('refuses someone who is not in the room', () => {
    const { room } = withPlayers(['Anna', 'Bram'])

    expect(startGame(room, { as: 'player', playerId: 'stranger' }, context())).toEqual({
      problem: { from: 'room', code: 'notInRoom', args: [] },
    })
  })

  it('cannot change settings once the game is on', () => {
    const { room, ids } = withPlayers(['Anna', 'Bram'])
    const started = roomOf(startGame(room, { as: 'table' }, context()))

    expect(changeSettings(started, { as: 'player', playerId: ids[0] }, { target: 3 }, context())).toEqual({
      problem: { from: 'room', code: 'alreadyStarted', args: [] },
    })
  })
})

describe('moves', () => {
  function started() {
    const players = withPlayers(['Anna', 'Bram'])
    return { ...players, room: roomOf(startGame(players.room, { as: 'table' }, context())) }
  }

  it('passes a move to the rules and keeps the new state', () => {
    const { room, ids } = started()

    const moved = roomOf(makeMove(room, ids[0], { add: 2 }, context()))

    expect(moved.gameState).toMatchObject({ count: 2, turn: 1 })
    expect(moved.version).toBe(room.version + 1)
  })

  it('refuses a move that does not have the game move shape', () => {
    const { room, ids } = started()

    expect(makeMove(room, ids[0], { add: 'lots' }, context())).toEqual({
      problem: { from: 'room', code: 'badMove', args: [] },
    })
  })

  it('passes on the game rules refusal', () => {
    const { room, ids } = started()

    expect(makeMove(room, ids[1], { add: 1 }, context())).toEqual({
      problem: { from: 'game', game: 'counting', code: 'notYourTurn', args: [] },
    })
  })

  it('refuses moves from watchers', () => {
    const players = withPlayers(['Anna', 'Bram', 'Cas', 'Dirk'])
    const room = roomOf(startGame(players.room, { as: 'table' }, context()))

    expect(makeMove(room, players.ids[3], { add: 1 }, context())).toEqual({
      problem: { from: 'room', code: 'notSeated', args: [] },
    })
  })
})

describe('views', () => {
  it('show each seat only its own secret, the table none, and never a token', () => {
    const { room, ids, tokens } = withPlayers(['Anna', 'Bram'])
    const started = roomOf(startGame(room, { as: 'table' }, context()))
    const secrets = (started.gameState as { secrets: number[] }).secrets

    const annaView = viewRoom(started, { as: 'player', playerId: ids[0] }, nobodyConnected, rules)
    const tableView = viewRoom(started, { as: 'table' }, nobodyConnected, rules)

    expect(annaView.gameView).toMatchObject({ mySecret: secrets[0] })
    expect(JSON.stringify(annaView)).not.toContain(`"mySecret":${secrets[1]}`)
    expect(tableView.gameView).toMatchObject({ mySecret: null })
    expect(JSON.stringify([annaView, tableView])).not.toContain(tokens[0])
  })

  it('say who is connected and how many table screens there are', () => {
    const { room, ids } = withPlayers(['Anna', 'Bram'])

    const view = viewRoom(room, { as: 'table' }, { connectedPlayerIds: new Set([ids[1]]), tableScreens: 2 }, rules)

    expect(view.players.map((player) => player.isConnected)).toEqual([false, true])
    expect(view.tableScreens).toBe(2)
    expect(view.canStart).toBe(true)
  })
})

describe('after a game', () => {
  function finished() {
    const players = withPlayers(['Anna', 'Bram'])
    let room = roomOf(startGame(players.room, { as: 'table' }, context()))
    room = roomOf(makeMove(room, players.ids[0], { add: 2 }, context()))
    room = roomOf(makeMove(room, players.ids[1], { add: 2 }, context()))
    room = roomOf(makeMove(room, players.ids[0], { add: 2 }, context()))
    return { ...players, room }
  }

  it('plays again only once the game is over', () => {
    const players = withPlayers(['Anna', 'Bram'])
    const running = roomOf(startGame(players.room, { as: 'table' }, context()))

    expect(playAgain(running, { as: 'table' }, context())).toEqual({
      problem: { from: 'room', code: 'notOver', args: [] },
    })
    expect(roomOf(playAgain(finished().room, { as: 'table' }, context())).gameState).toMatchObject({ count: 0 })
  })

  it('lets a seated player leave once it is over, but not during play', () => {
    const players = withPlayers(['Anna', 'Bram'])
    const running = roomOf(startGame(players.room, { as: 'table' }, context()))
    const { room, ids } = finished()

    expect(leaveRoom(running, players.ids[0], context())).toEqual({
      problem: { from: 'room', code: 'cannotLeaveMidGame', args: [] },
    })
    expect(roomOf(leaveRoom(room, ids[0], context())).players.map((player) => player.name)).toEqual(['Bram'])
  })

  it('goes back to the lobby when someone ends the game', () => {
    const { room, ids } = finished()

    const ended = roomOf(endGame(room, { as: 'player', playerId: ids[1] }, context()))

    expect(ended).toMatchObject({ phase: 'lobby', seats: [], gameState: null })
  })
})

describe('expiry', () => {
  it('expires a room nobody touched for the lifetime', () => {
    const room = newRoom()

    expect(isExpired(room, room.lastActiveAt + ROOM_LIFETIME_MS - 1)).toBe(false)
    expect(isExpired(room, room.lastActiveAt + ROOM_LIFETIME_MS)).toBe(true)
    expect(nextWakeAt(room)).toBe(room.lastActiveAt + ROOM_LIFETIME_MS)
  })

  it('wakes earlier when the game asked for it', () => {
    const room = { ...newRoom(), gameWakeAt: 5000 }

    expect(nextWakeAt(room)).toBe(5000)
  })
})
