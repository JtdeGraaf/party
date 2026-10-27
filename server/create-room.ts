import { createRoomRequestSchema } from '../src/party/protocol'
import type { Random } from '../src/party/random'
import { newRoomCode, readRoomCode, type RoomCode } from '../src/party/room-code'
import type { RoomDirectory } from './hosting'

/** Codes tried before giving up; with 160,000 codes and rooms lasting hours, more than one try is already rare. */
const CODE_TRIES = 20

export type CreateRoomAnswer =
  | { status: 201; body: { code: RoomCode } }
  | { status: 400; body: { problem: 'badRequest' | 'unknownGame' | 'badSettings' } }
  | { status: 503; body: { problem: 'noFreeCode' } }

/** Opens a new room for the game in the request body, under a code nobody uses yet. */
export async function createRoom(directory: RoomDirectory, body: unknown, random: Random): Promise<CreateRoomAnswer> {
  const request = createRoomRequestSchema.safeParse(body)
  if (!request.success) return { status: 400, body: { problem: 'badRequest' } }

  for (let attempt = 0; attempt < CODE_TRIES; attempt++) {
    const code = newRoomCode(random)
    const result = await directory.open(code, request.data.game, request.data.settings)
    if (result === 'opened') return { status: 201, body: { code } }
    if (result !== 'taken') return { status: 400, body: { problem: result } }
  }
  return { status: 503, body: { problem: 'noFreeCode' } }
}

const ROOM_SOCKET_PATH = /^\/api\/rooms\/([A-Z]{4})\/socket$/

/** The room a socket path leads to, like `/api/rooms/KWPF/socket`, or null for any other path. */
export function roomOfSocketPath(pathname: string): RoomCode | null {
  const match = ROOM_SOCKET_PATH.exec(pathname)
  return match ? readRoomCode(match[1]) : null
}

export const CREATE_ROOM_PATH = '/api/rooms'
