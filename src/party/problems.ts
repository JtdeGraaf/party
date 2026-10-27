/**
 * What the room itself can refuse. Each code has an `errors.<code>` text in every language; a game's own refusals
 * live in that game's translations instead.
 */
export const ROOM_PROBLEMS = [
  'roomNotFound',
  'roomFull',
  'notInRoom',
  'notSeated',
  'alreadyStarted',
  'notStarted',
  'tooFewPlayers',
  'notOver',
  'cannotLeaveMidGame',
  'badMessage',
  'badMove',
  'badSettings',
  'nameMissing',
] as const

export type RoomProblemCode = (typeof ROOM_PROBLEMS)[number]

/** A refusal as it travels to the phone: from the room, or from the rules of the game being played. */
export type Problem =
  | { from: 'room'; code: RoomProblemCode; args: (string | number)[] }
  | { from: 'game'; game: string; code: string; args: (string | number)[] }

export function roomProblem(code: RoomProblemCode, ...args: (string | number)[]): Problem {
  return { from: 'room', code, args }
}
