import { describe, expect, it } from 'vitest'
import type { HartenjagenView } from '../src/games/hartenjagen/rules/hartenjagen-rules'
import type { DotsAndBoxesView } from '../src/games/dotsandboxes/rules/dotsandboxes-rules'
import { serverMessageSchema, type RoomView, type ServerMessage } from '../src/party/protocol'
import { seededRandom } from '../src/party/random'
import { ROOM_LIFETIME_MS } from '../src/party/room'
import { createRoom, roomOfSocketPath } from './create-room'
import { InMemoryHost, type InMemorySocket } from './in-memory/in-memory-host'

/** A phone or table screen in a test: it remembers everything the server sent it. */
class TestScreen {
  readonly received: ServerMessage[] = []
  readonly socket: InMemorySocket

  constructor(host: InMemoryHost, code: string) {
    this.socket = host.connect(code, (text) => this.received.push(serverMessageSchema.parse(JSON.parse(text))))
  }

  send(message: object): Promise<void> {
    return this.socket.sendToServer(JSON.stringify(message))
  }

  get view(): RoomView {
    const views = this.received.flatMap((message) => (message.type === 'view' ? [message.view] : []))
    return views[views.length - 1]
  }

  get welcome() {
    return this.received.find((message) => message.type === 'welcome')
  }

  get problems() {
    return this.received.flatMap((message) => (message.type === 'problem' ? [message.problem] : []))
  }
}

function setUp() {
  let now = 1_000_000
  const host = new InMemoryHost({ random: seededRandom(42), now: () => now })
  return { host, advance: (ms: number) => (now += ms) }
}

async function openRoom(host: InMemoryHost, game: string, settings?: unknown): Promise<string> {
  const answer = await createRoom(host, { game, settings }, seededRandom(5))
  if (answer.status !== 201) throw new Error(JSON.stringify(answer))
  return answer.body.code
}

async function seatPlayers(host: InMemoryHost, code: string, names: string[]): Promise<TestScreen[]> {
  const phones: TestScreen[] = []
  for (const name of names) {
    const phone = new TestScreen(host, code)
    await phone.send({ type: 'hello', as: 'player', name, seatToken: null })
    phones.push(phone)
  }
  return phones
}

describe('creating rooms', () => {
  it('opens a room under a fresh four-letter code', async () => {
    const { host } = setUp()

    const code = await openRoom(host, 'dotsandboxes', { size: 3 })

    expect(code).toMatch(/^[A-Z]{4}$/)
    expect(host.storedRoom(code)).toMatchObject({ game: 'dotsandboxes', settings: { size: 3 }, phase: 'lobby' })
  })

  it('draws another code when the first one is taken', async () => {
    const { host } = setUp()
    const first = await openRoom(host, 'dotsandboxes')

    const second = await createRoom(host, { game: 'dotsandboxes' }, seededRandom(5))

    expect(second.status).toBe(201)
    expect(second.status === 201 && second.body.code).not.toBe(first)
  })

  it('refuses a game it does not know and settings the game does not allow', async () => {
    const { host } = setUp()

    expect(await createRoom(host, { game: 'chess' }, seededRandom(1))).toEqual({
      status: 400,
      body: { problem: 'unknownGame' },
    })
    expect(await createRoom(host, { game: 'dotsandboxes', settings: { size: 9 } }, seededRandom(1))).toEqual({
      status: 400,
      body: { problem: 'badSettings' },
    })
    expect(await createRoom(host, 'not json at all', seededRandom(1))).toEqual({
      status: 400,
      body: { problem: 'badRequest' },
    })
  })

  it('only routes socket paths with a real room code', () => {
    expect(roomOfSocketPath('/api/rooms/KWPF/socket')).toBe('KWPF')
    expect(roomOfSocketPath('/api/rooms/KOPF/socket')).toBeNull()
    expect(roomOfSocketPath('/api/rooms/KWPF')).toBeNull()
  })
})

describe('a room with phones', () => {
  it('tells a phone that knocks on a room nobody opened', async () => {
    const { host } = setUp()
    const phone = new TestScreen(host, 'ZZZZ')

    await phone.send({ type: 'hello', as: 'player', name: 'Anna', seatToken: null })

    expect(phone.problems).toEqual([{ from: 'room', code: 'roomNotFound', args: [] }])
    expect(phone.socket.isOpen).toBe(false)
  })

  it('answers a message it cannot read with a problem, and carries on', async () => {
    const { host } = setUp()
    const code = await openRoom(host, 'dotsandboxes')
    const [anna] = await seatPlayers(host, code, ['Anna'])

    await anna.socket.sendToServer('{"type":"teleport"}')

    expect(anna.problems).toEqual([{ from: 'room', code: 'badMessage', args: [] }])
    expect(anna.socket.isOpen).toBe(true)
  })

  it('welcomes each phone and shows everyone who is in, and who is connected', async () => {
    const { host } = setUp()
    const code = await openRoom(host, 'dotsandboxes')
    const [anna, bram] = await seatPlayers(host, code, ['Anna', 'Bram'])

    await bram.socket.hangUp()

    expect(anna.welcome).toMatchObject({ type: 'welcome' })
    expect(anna.view.players.map(({ name, isConnected }) => ({ name, isConnected }))).toEqual([
      { name: 'Anna', isConnected: true },
      { name: 'Bram', isConnected: false },
    ])
  })

  it('plays a move and sends the new board to every phone and the table screen', async () => {
    const { host } = setUp()
    const code = await openRoom(host, 'dotsandboxes', { size: 3 })
    const [anna, bram] = await seatPlayers(host, code, ['Anna', 'Bram'])
    const table = new TestScreen(host, code)
    await table.send({ type: 'hello', as: 'table' })

    await table.send({ type: 'start' })
    await anna.send({ type: 'move', move: { line: 'h-0-0' } })

    for (const screen of [anna, bram, table]) {
      expect((screen.view.gameView as DotsAndBoxesView).drawnLines).toEqual({ 'h-0-0': 0 })
    }
    expect(bram.view.tableScreens).toBe(1)
    expect(table.view.me).toBeNull()
  })

  it('sends a refused move back only to the phone that made it', async () => {
    const { host } = setUp()
    const code = await openRoom(host, 'dotsandboxes', { size: 3 })
    const [anna, bram] = await seatPlayers(host, code, ['Anna', 'Bram'])
    await anna.send({ type: 'start' })

    await bram.send({ type: 'move', move: { line: 'h-0-0' } })

    expect(bram.problems).toEqual([{ from: 'game', game: 'dotsandboxes', code: 'notYourTurn', args: [] }])
    expect(anna.problems).toEqual([])
  })
})

describe('hidden hands', () => {
  it('never sends a phone anyone else’s cards, nor the table screen any', async () => {
    const { host } = setUp()
    const code = await openRoom(host, 'hartenjagen')
    const phones = await seatPlayers(host, code, ['Anna', 'Bram', 'Cas', 'Dirk'])
    const table = new TestScreen(host, code)
    await table.send({ type: 'hello', as: 'table' })

    await table.send({ type: 'start' })

    const stored = host.storedRoom(code)
    if (!stored) throw new Error('the room was not stored')
    const hands = (stored.gameState as { hands: { deal: { hands: string[][] } }[] }).hands[0].deal.hands
    phones.forEach((phone, seat) => {
      const everythingReceived = JSON.stringify(phone.received)
      const othersCards = hands.filter((_, other) => other !== seat).flat()
      expect(othersCards.filter((card) => everythingReceived.includes(`"${card}"`))).toEqual([])
      expect((phone.view.gameView as HartenjagenView).mine?.cards.sort()).toEqual([...hands[seat]].sort())
    })
    const tableReceived = JSON.stringify(table.received)
    expect(hands.flat().filter((card) => tableReceived.includes(`"${card}"`))).toEqual([])
  })
})

describe('coming back', () => {
  it('puts a phone back in its seat with its own hand after the server slept', async () => {
    const { host } = setUp()
    const code = await openRoom(host, 'hartenjagen')
    const phones = await seatPlayers(host, code, ['Anna', 'Bram', 'Cas', 'Dirk'])
    await phones[0].send({ type: 'start' })
    const bramToken = phones[1].welcome?.type === 'welcome' ? phones[1].welcome.seatToken : null
    const bramCards = (phones[1].view.gameView as HartenjagenView).mine?.cards

    await phones[1].socket.hangUp()
    host.putToSleep(code)
    const bramAgain = new TestScreen(host, code)
    await bramAgain.send({ type: 'hello', as: 'player', name: 'Bram', seatToken: bramToken })

    expect(bramAgain.view.me).toEqual({ playerId: phones[1].view.me?.playerId, seat: 1 })
    expect((bramAgain.view.gameView as HartenjagenView).mine?.cards).toEqual(bramCards)
    expect(bramAgain.view.players).toHaveLength(4)
  })

  it('answers a refresh with the latest view, so a phone that missed messages catches up', async () => {
    const { host } = setUp()
    const code = await openRoom(host, 'dotsandboxes')
    const [anna] = await seatPlayers(host, code, ['Anna'])
    const seenBefore = anna.received.length

    await anna.send({ type: 'refresh' })

    expect(anna.received).toHaveLength(seenBefore + 1)
    expect(anna.view.players.map((player) => player.name)).toEqual(['Anna'])
  })
})

describe('quiet rooms', () => {
  it('are thrown away once nobody touched them for the lifetime', async () => {
    const { host, advance } = setUp()
    const code = await openRoom(host, 'dotsandboxes')
    const [anna] = await seatPlayers(host, code, ['Anna'])

    advance(ROOM_LIFETIME_MS)
    await host.ringDueAlarms()

    expect(host.storedRoom(code)).toBeNull()
    expect(anna.socket.isOpen).toBe(false)
  })

  it('stay while people are still using them', async () => {
    const { host, advance } = setUp()
    const code = await openRoom(host, 'dotsandboxes')
    const [anna] = await seatPlayers(host, code, ['Anna'])

    advance(ROOM_LIFETIME_MS - 1)
    await anna.send({ type: 'settings', settings: { size: 5 } })
    advance(2)
    await host.ringDueAlarms()

    expect(host.storedRoom(code)).toMatchObject({ settings: { size: 5 } })
  })
})
