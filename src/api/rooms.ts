import { createRoomResponseSchema } from '@/party/protocol'
import { readRoomCode, type RoomCode } from '@/party/room-code'

/**
 * The one boundary to the room server over plain HTTP and WebSockets. Everything else asks this file for URLs and
 * requests, so no other code knows where the server lives.
 */

export class RoomRequestError extends Error {
  readonly code: 'offline' | 'refused'

  constructor(code: 'offline' | 'refused') {
    super(code)
    this.code = code
  }
}

/** Opens a new room for a game. Fails with `offline` when the server can't be reached, `refused` when it said no. */
export async function createRoom(game: string, settings: unknown): Promise<RoomCode> {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game, settings }),
  }).catch(() => {
    throw new RoomRequestError('offline')
  })
  if (!response.ok) throw new RoomRequestError(response.status >= 500 ? 'offline' : 'refused')
  const parsed = createRoomResponseSchema.safeParse(await response.json().catch(() => null))
  const code = parsed.success ? readRoomCode(parsed.data.code) : null
  if (!code) throw new RoomRequestError('refused')
  return code
}

export function roomSocketUrl(code: RoomCode): string {
  const { origin } = window.location
  return `${origin.replace(/^http/, 'ws')}/api/rooms/${code}/socket`
}

/** The link a friend opens by scanning the QR code. */
export function joinLinkFor(code: string): string {
  return `${window.location.origin}/join/${code}`
}
