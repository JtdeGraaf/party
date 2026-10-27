import { z } from 'zod'
import { ROOM_PROBLEMS } from './problems'
import { MAX_NAME_LENGTH } from './player-name'

/**
 * Every message between a phone or table screen and its room, both ways, as JSON over one WebSocket. The server
 * always sends a whole view, never a change, so a phone that missed messages is right again with the next one.
 */

const seatToken = z.string().regex(/^[0-9a-f]{32}$/)

const helloSchema = z.discriminatedUnion('as', [
  z.object({
    type: z.literal('hello'),
    as: z.literal('player'),
    name: z
      .string()
      .min(1)
      .max(MAX_NAME_LENGTH * 4),
    seatToken: seatToken.nullable(),
  }),
  z.object({ type: z.literal('hello'), as: z.literal('table') }),
])

export const clientMessageSchema = z.discriminatedUnion('type', [
  helloSchema,
  z.object({ type: z.literal('refresh') }),
  z.object({ type: z.literal('settings'), settings: z.unknown() }),
  z.object({ type: z.literal('start') }),
  z.object({ type: z.literal('move'), move: z.unknown() }),
  z.object({ type: z.literal('play-again') }),
  z.object({ type: z.literal('end-game') }),
  z.object({ type: z.literal('leave') }),
])

export type ClientMessage = z.infer<typeof clientMessageSchema>

export const roomPlayerViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  isConnected: z.boolean(),
  /** Their seat in the game being played, or null in the lobby and for watchers. */
  seat: z.number().int().nonnegative().nullable(),
})

export type RoomPlayerView = z.infer<typeof roomPlayerViewSchema>

export const roomViewSchema = z.object({
  /** Goes up with every change; a phone ignores a view older than the one it shows. */
  version: z.number().int().nonnegative(),
  code: z.string(),
  game: z.string(),
  settings: z.unknown(),
  phase: z.enum(['lobby', 'playing']),
  /** In the order they joined. */
  players: z.array(roomPlayerViewSchema),
  /** This phone's player, or null for a table screen. */
  me: z.object({ playerId: z.string(), seat: z.number().int().nonnegative().nullable() }).nullable(),
  tableScreens: z.number().int().nonnegative(),
  canStart: z.boolean(),
  isOver: z.boolean(),
  /** The game's own view for this viewer, checked by the game's view schema. Null in the lobby. */
  gameView: z.unknown(),
})

export type RoomView = z.infer<typeof roomViewSchema>

const problemArgs = z.array(z.union([z.string(), z.number()]))

export const problemSchema = z.discriminatedUnion('from', [
  z.object({ from: z.literal('room'), code: z.enum(ROOM_PROBLEMS), args: problemArgs }),
  z.object({ from: z.literal('game'), game: z.string(), code: z.string(), args: problemArgs }),
])

export const serverMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('welcome'), playerId: z.string(), seatToken }),
  z.object({ type: z.literal('view'), view: roomViewSchema }),
  z.object({ type: z.literal('problem'), problem: problemSchema }),
])

export type ServerMessage = z.infer<typeof serverMessageSchema>

/** A JSON text as a message of `schema`, or null when it isn't one. */
export function readMessage<T>(schema: z.ZodType<T>, text: string): T | null {
  try {
    const parsed = schema.safeParse(JSON.parse(text))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/** Without settings the room uses the game's defaults. */
export const createRoomRequestSchema = z.object({ game: z.string(), settings: z.unknown().optional() })
export const createRoomResponseSchema = z.object({ code: z.string() })
