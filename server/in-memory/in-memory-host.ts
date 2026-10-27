import type { RoomState } from '../../src/party/room'
import type { Random } from '../../src/party/random'
import type { Connection, ConnectionIdentity, OpenResult, RoomDirectory } from '../hosting'
import { RoomServer } from '../room-server'

/**
 * The whole room server in one process, with nothing stored on disk. Tests run every room through it, which also
 * keeps the hosting interfaces honest: anything Cloudflare does for the server, this does too.
 */
export class InMemoryHost implements RoomDirectory {
  private readonly rooms = new Map<string, InMemoryRoom>()
  private readonly random: Random
  private readonly clock: () => number

  constructor({ random, now }: { random: Random; now: () => number }) {
    this.random = random
    this.clock = now
  }

  open(code: string, game: string, settings: unknown): Promise<OpenResult> {
    return this.roomFor(code).server.open(code, game, settings)
  }

  /** Opens a socket to a room. Messages the server sends arrive in `onMessage`. */
  connect(code: string, onMessage: (text: string) => void): InMemorySocket {
    const room = this.roomFor(code)
    const socket = new InMemorySocket(room, onMessage)
    room.connections.add(socket)
    return socket
  }

  /** Rings every alarm that is due by now, as Cloudflare would. */
  async ringDueAlarms(): Promise<void> {
    for (const room of this.rooms.values()) {
      if (room.alarmAt !== null && room.alarmAt <= this.clock()) {
        room.alarmAt = null
        await room.server.wake()
      }
    }
  }

  /** The stored state of a room, as the server last saved it. */
  storedRoom(code: string): RoomState | null {
    return this.rooms.get(code)?.saved ?? null
  }

  /** Throws away the server's memory of a room, as a host does when it puts a quiet room to sleep. */
  putToSleep(code: string): void {
    const room = this.rooms.get(code)
    if (room) room.server = this.newServer(room)
  }

  private roomFor(code: string): InMemoryRoom {
    const existing = this.rooms.get(code)
    if (existing) return existing
    const room: InMemoryRoom = { saved: null, alarmAt: null, connections: new Set(), server: null as unknown as RoomServer }
    room.server = this.newServer(room)
    this.rooms.set(code, room)
    return room
  }

  private newServer(room: InMemoryRoom): RoomServer {
    return new RoomServer({
      storage: {
        load: async () => (room.saved ? copyOf(room.saved) : null),
        save: async (state) => {
          room.saved = copyOf(state)
        },
        deleteAll: async () => {
          room.saved = null
          room.alarmAt = null
        },
      },
      wakeups: {
        wakeAt: async (time) => {
          room.alarmAt = time
        },
        cancel: async () => {
          room.alarmAt = null
        },
      },
      connections: () => [...room.connections],
      random: this.random,
      now: this.clock,
    })
  }
}

type InMemoryRoom = {
  saved: RoomState | null
  alarmAt: number | null
  connections: Set<InMemorySocket>
  server: RoomServer
}

export class InMemorySocket implements Connection {
  private readonly room: InMemoryRoom
  private readonly onMessage: (text: string) => void
  private remembered: ConnectionIdentity | null = null
  isOpen = true

  constructor(room: InMemoryRoom, onMessage: (text: string) => void) {
    this.room = room
    this.onMessage = onMessage
  }

  /** From the phone to the server. */
  sendToServer(text: string): Promise<void> {
    if (!this.isOpen) return Promise.resolve()
    return this.room.server.receive(this, text)
  }

  /** The phone hangs up. */
  async hangUp(): Promise<void> {
    if (!this.isOpen) return
    this.isOpen = false
    this.room.connections.delete(this)
    await this.room.server.closed(this)
  }

  send(text: string): void {
    if (this.isOpen) this.onMessage(text)
  }

  close(): void {
    this.isOpen = false
    this.room.connections.delete(this)
  }

  identity(): ConnectionIdentity | null {
    return this.remembered
  }

  identify(identity: ConnectionIdentity): void {
    this.remembered = identity
  }
}

/** Stored the way a real host stores it: as JSON, so nothing that isn't plain data survives. */
function copyOf(room: RoomState): RoomState {
  return JSON.parse(JSON.stringify(room)) as RoomState
}
