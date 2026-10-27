import type { RoomState } from '../src/party/room'
import type { Random } from '../src/party/random'

/**
 * What the room server needs from wherever it runs. Cloudflare (in `worker/`) and the in-memory host for tests
 * each implement these; nothing in `server/` knows which one it is talking to.
 */

/** Who a connection is, once it said hello. */
export type ConnectionIdentity = { as: 'table' } | { as: 'player'; playerId: string }

/** One open WebSocket to a room. */
export interface Connection {
  send(text: string): void
  close(): void
  /** Null until the connection said hello. The host remembers it, even if the room is put to sleep between messages. */
  identity(): ConnectionIdentity | null
  identify(identity: ConnectionIdentity): void
}

/** Where a room keeps its state between messages. */
export interface RoomStorage {
  /** Whatever was saved last, unchecked, or null when nothing was. */
  load(): Promise<unknown>
  save(room: RoomState): Promise<void>
  deleteAll(): Promise<void>
}

/** One alarm per room. When it goes off, the host calls `RoomServer.wake()`. */
export interface Wakeups {
  /** Replaces any earlier alarm. `time` is ms since 1970. */
  wakeAt(time: number): Promise<void>
  cancel(): Promise<void>
}

export type RoomHosting = {
  storage: RoomStorage
  wakeups: Wakeups
  /** Every connection open to this room right now. */
  connections(): Connection[]
  random: Random
  /** ms since 1970. */
  now(): number
}

export type OpenResult = 'opened' | 'taken' | 'unknownGame' | 'badSettings'

/** Reaches a room by its code, wherever it lives. */
export interface RoomDirectory {
  /** Opens a new room under `code`, or answers 'taken' when that code is in use. */
  open(code: string, game: string, settings: unknown): Promise<OpenResult>
}
