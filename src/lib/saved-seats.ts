import { z } from 'zod'
import { cleanName } from '@/party/player-name'

/**
 * What this phone remembers: the name its player goes by, and per room the token that proves it holds a seat there.
 * It lives in localStorage, so anything read back is checked.
 */

const NAME_KEY = 'party:name'
const seatKey = (code: string) => `party:seat:${code}`

const savedSeatSchema = z.object({ playerId: z.string(), seatToken: z.string().regex(/^[0-9a-f]{32}$/) })

export type SavedSeat = z.infer<typeof savedSeatSchema>

export function readSavedName(storage: Storage): string | null {
  const saved = storage.getItem(NAME_KEY)
  return saved === null ? null : cleanName(saved)
}

export function saveName(storage: Storage, name: string): void {
  storage.setItem(NAME_KEY, name)
}

export function readSavedSeat(storage: Storage, code: string): SavedSeat | null {
  const text = storage.getItem(seatKey(code))
  if (text === null) return null
  try {
    const parsed = savedSeatSchema.safeParse(JSON.parse(text))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveSeat(storage: Storage, code: string, seat: SavedSeat): void {
  storage.setItem(seatKey(code), JSON.stringify(seat))
}

export function forgetSeat(storage: Storage, code: string): void {
  storage.removeItem(seatKey(code))
}
