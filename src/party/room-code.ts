import type { Random } from './random'

/**
 * A room's code: four capital letters like KWPF, read off a TV across the room. Only consonants that can't be
 * misread (no I, O, U or Y), which also keeps the codes from spelling words.
 */
export type RoomCode = string & { readonly brand: 'RoomCode' }

export const ROOM_CODE_LETTERS = 'BCDFGHJKLMNPQRSTVWXZ'
export const ROOM_CODE_LENGTH = 4

export function newRoomCode(random: Random): RoomCode {
  return Array.from({ length: ROOM_CODE_LENGTH }, () => ROOM_CODE_LETTERS[random.below(ROOM_CODE_LETTERS.length)]).join(
    '',
  ) as RoomCode
}

/** Reads a code as someone typed it: lower case, spaces and dashes are fine. Null when it can't be a code. */
export function readRoomCode(typed: string): RoomCode | null {
  const letters = typed.toUpperCase().replace(/[\s-]/g, '')
  if (letters.length !== ROOM_CODE_LENGTH) return null
  if (![...letters].every((letter) => ROOM_CODE_LETTERS.includes(letter))) return null
  return letters as RoomCode
}
