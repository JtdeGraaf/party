import { z } from 'zod'
import { isGameProblem, type AnyGameRules, type Outcome, type Viewer } from './game-rules'
import { cleanName } from './player-name'
import { roomProblem, type Problem } from './problems'
import type { RoomView } from './protocol'
import type { Random } from './random'

/**
 * One room: who is in it, which game it plays, and that game's state. Every change goes through a function here
 * that checks it first, so the server never stores a room the rules wouldn't allow.
 */

/** More people than this can't join one room; most games seat far fewer and the rest watch. */
export const MAX_PEOPLE = 16

/** A room nobody touched for this long is thrown away. */
export const ROOM_LIFETIME_MS = 12 * 60 * 60 * 1000

const roomPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Proves a phone is this player when it reconnects. Never sent to anyone else. */
  seatToken: z.string(),
  joinedAt: z.number(),
})

export const roomStateSchema = z.object({
  version: z.number().int().nonnegative(),
  code: z.string(),
  game: z.string(),
  settings: z.unknown(),
  createdAt: z.number(),
  lastActiveAt: z.number(),
  phase: z.enum(['lobby', 'playing']),
  /** How many games were started in this room. */
  gamesStarted: z.number().int().nonnegative(),
  /** In the order they joined. */
  players: z.array(roomPlayerSchema),
  /** Player ids by seat number for the game being played; empty in the lobby. */
  seats: z.array(z.string()),
  /** Null in the lobby. */
  gameState: z.unknown(),
  /** When the game asked to be woken up, or null. */
  gameWakeAt: z.number().nullable(),
})

export type RoomPlayer = z.infer<typeof roomPlayerSchema>
export type RoomState = z.infer<typeof roomStateSchema>

/** Who asked for something: a player's phone, or a table screen. */
export type Actor = { as: 'table' } | { as: 'player'; playerId: string }

export type RoomContext = { rules: AnyGameRules; random: Random; now: number }

export type RoomResult = { room: RoomState } | { problem: Problem }

export function isProblem(result: RoomResult): result is { problem: Problem } {
  return 'problem' in result
}

export function openRoom(code: string, settings: unknown, { rules, now }: RoomContext): RoomResult {
  const checked = rules.settingsSchema.safeParse(settings ?? rules.defaultSettings)
  if (!checked.success) return { problem: roomProblem('badSettings') }
  return {
    room: {
      version: 0,
      code,
      game: rules.id,
      settings: checked.data,
      createdAt: now,
      lastActiveAt: now,
      phase: 'lobby',
      gamesStarted: 0,
      players: [],
      seats: [],
      gameState: null,
      gameWakeAt: null,
    },
  }
}

export type JoinResult = { room: RoomState; player: RoomPlayer } | { problem: Problem }

/**
 * A phone sits down. With the token it got before it is the same player again, in the same seat; without one it
 * is someone new, who plays now if the game is in the lobby or lets people join mid-game, and watches otherwise.
 */
export function joinAsPlayer(
  room: RoomState,
  { name, seatToken }: { name: string; seatToken: string | null },
  context: RoomContext,
): JoinResult {
  const cleanedName = cleanName(name)
  if (cleanedName === null) return { problem: roomProblem('nameMissing') }

  const returning = room.players.find((player) => seatToken !== null && player.seatToken === seatToken)
  if (returning) {
    const player = { ...returning, name: cleanedName }
    const players = room.players.map((existing) => (existing.id === player.id ? player : existing))
    return { room: touched({ ...room, players }, context.now), player }
  }

  if (room.players.length >= MAX_PEOPLE) return { problem: roomProblem('roomFull') }
  const player: RoomPlayer = {
    id: randomHex(context.random, 12),
    name: cleanedName,
    seatToken: randomHex(context.random, 32),
    joinedAt: context.now,
  }
  const joined = { ...room, players: [...room.players, player] }
  const seated = seatMidGame(joined, player.id, context)
  return { room: touched(seated, context.now), player }
}

export function changeSettings(room: RoomState, actor: Actor, settings: unknown, context: RoomContext): RoomResult {
  if (!isInRoom(room, actor)) return { problem: roomProblem('notInRoom') }
  if (room.phase !== 'lobby') return { problem: roomProblem('alreadyStarted') }
  const checked = context.rules.settingsSchema.safeParse(settings)
  if (!checked.success) return { problem: roomProblem('badSettings') }
  return { room: touched({ ...room, settings: checked.data }, context.now) }
}

/** Anyone in the room, or a table screen, can start once enough people are in. The first to join get the seats. */
export function startGame(room: RoomState, actor: Actor, context: RoomContext): RoomResult {
  if (!isInRoom(room, actor)) return { problem: roomProblem('notInRoom') }
  if (room.phase !== 'lobby') return { problem: roomProblem('alreadyStarted') }
  return seatAndStart(room, context)
}

/** After a game is over, the same room plays again; people who joined meanwhile get a seat if there's room. */
export function playAgain(room: RoomState, actor: Actor, context: RoomContext): RoomResult {
  if (!isInRoom(room, actor)) return { problem: roomProblem('notInRoom') }
  if (room.phase !== 'playing') return { problem: roomProblem('notStarted') }
  if (!context.rules.isOver(room.gameState)) return { problem: roomProblem('notOver') }
  return seatAndStart(room, context)
}

/** Stops the game for everyone and goes back to the lobby. The phone asks before it sends this. */
export function endGame(room: RoomState, actor: Actor, context: RoomContext): RoomResult {
  if (!isInRoom(room, actor)) return { problem: roomProblem('notInRoom') }
  if (room.phase !== 'playing') return { problem: roomProblem('notStarted') }
  return { room: touched({ ...room, phase: 'lobby', seats: [], gameState: null, gameWakeAt: null }, context.now) }
}

export function makeMove(room: RoomState, playerId: string, move: unknown, context: RoomContext): RoomResult {
  if (room.phase !== 'playing') return { problem: roomProblem('notStarted') }
  const seat = room.seats.indexOf(playerId)
  if (seat === -1) return { problem: roomProblem('notSeated') }
  const checked = context.rules.moveSchema.safeParse(move)
  if (!checked.success) return { problem: roomProblem('badMove') }

  const result = context.rules.move(room.gameState, {
    seat,
    move: checked.data,
    random: context.random,
    now: context.now,
  })
  if (isGameProblem(result)) {
    return { problem: { from: 'game', game: room.game, code: result.problem, args: result.args ?? [] } }
  }
  return { room: touched(withOutcome(room, result), context.now) }
}

/** Runs the game's wake-up once its time has come. Returns the room unchanged when there is nothing to do. */
export function wakeGame(room: RoomState, context: RoomContext): RoomState {
  const { rules, now, random } = context
  if (room.phase !== 'playing' || room.gameWakeAt === null || room.gameWakeAt > now) return room
  if (!rules.wake) return { ...room, gameWakeAt: null }
  return bumped(withOutcome(room, rules.wake(room.gameState, { random, now })))
}

/** Leaving is free in the lobby, for watchers, and once a game is over; walking out of a game in play is not. */
export function leaveRoom(room: RoomState, playerId: string, context: RoomContext): RoomResult {
  if (!room.players.some((player) => player.id === playerId)) return { problem: roomProblem('notInRoom') }
  const isPlaying = room.phase === 'playing' && !context.rules.isOver(room.gameState)
  if (isPlaying && room.seats.includes(playerId)) return { problem: roomProblem('cannotLeaveMidGame') }
  const players = room.players.filter((player) => player.id !== playerId)
  return { room: touched({ ...room, players }, context.now) }
}

/** The next moment the room needs waking: the game's own wake-up, or the time it expires. */
export function nextWakeAt(room: RoomState): number {
  const expiresAt = room.lastActiveAt + ROOM_LIFETIME_MS
  return room.gameWakeAt === null ? expiresAt : Math.min(room.gameWakeAt, expiresAt)
}

export function isExpired(room: RoomState, now: number): boolean {
  return now >= room.lastActiveAt + ROOM_LIFETIME_MS
}

export type Presence = { connectedPlayerIds: ReadonlySet<string>; tableScreens: number }

/** What one connection may see of the room. Seat tokens never appear in it, and the game decides what of its own. */
export function viewRoom(room: RoomState, actor: Actor, presence: Presence, rules: AnyGameRules): RoomView {
  const seatOf = (playerId: string) => (room.seats.includes(playerId) ? room.seats.indexOf(playerId) : null)
  const me = actor.as === 'player' ? { playerId: actor.playerId, seat: seatOf(actor.playerId) } : null
  const isPlaying = room.phase === 'playing'
  return {
    version: room.version,
    code: room.code,
    game: room.game,
    settings: room.settings,
    phase: room.phase,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      isConnected: presence.connectedPlayerIds.has(player.id),
      seat: isPlaying ? seatOf(player.id) : null,
    })),
    me,
    tableScreens: presence.tableScreens,
    canStart: room.phase === 'lobby' && room.players.length >= rules.players.min,
    isOver: isPlaying && rules.isOver(room.gameState),
    gameView: isPlaying ? rules.view(room.gameState, viewerFor(me)) : null,
  }
}

function viewerFor(me: RoomView['me']): Viewer {
  if (me === null) return { as: 'table' }
  if (me.seat === null) return { as: 'watcher' }
  return { as: 'seat', seat: me.seat }
}

function seatAndStart(room: RoomState, { rules, random, now }: RoomContext): RoomResult {
  if (room.players.length < rules.players.min) return { problem: roomProblem('tooFewPlayers', rules.players.min) }
  const seats = room.players.slice(0, rules.players.max).map((player) => player.id)
  const gameNumber = room.gamesStarted + 1
  const outcome = rules.start({ seats: seats.length, settings: room.settings, gameNumber, random, now })
  return { room: touched(withOutcome({ ...room, phase: 'playing', gamesStarted: gameNumber, seats }, outcome), now) }
}

function seatMidGame(room: RoomState, playerId: string, { rules }: RoomContext): RoomState {
  if (room.phase !== 'playing' || !rules.joinsMidGame || !rules.seatAdded) return room
  if (room.seats.length >= rules.players.max || rules.isOver(room.gameState)) return room
  const seat = room.seats.length
  return withOutcome({ ...room, seats: [...room.seats, playerId] }, rules.seatAdded(room.gameState, { seat }))
}

function withOutcome(room: RoomState, outcome: Outcome<unknown>): RoomState {
  return { ...room, gameState: outcome.state, gameWakeAt: outcome.wakeAt ?? null }
}

function isInRoom(room: RoomState, actor: Actor): boolean {
  return actor.as === 'table' || room.players.some((player) => player.id === actor.playerId)
}

function touched(room: RoomState, now: number): RoomState {
  return { ...bumped(room), lastActiveAt: now }
}

function bumped(room: RoomState): RoomState {
  return { ...room, version: room.version + 1 }
}

function randomHex(random: Random, length: number): string {
  return Array.from({ length }, () => random.below(16).toString(16)).join('')
}
