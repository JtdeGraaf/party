/** Short enough to fit on a saucer, a name label or a TV's player list. */
export const MAX_NAME_LENGTH = 14

/** A name as typed, with spaces tidied and cut to fit, or null when nothing is left. */
export function cleanName(typed: string): string | null {
  const name = typed.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH).trim()
  return name === '' ? null : name
}
