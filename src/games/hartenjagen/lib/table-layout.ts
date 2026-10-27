/** The other seats in the order they play after you, so the table reads clockwise from your left. */
export function seatsAfter(playerCount: number, mySeat: number | null): number[] {
  const seats = Array.from({ length: playerCount }, (_, seat) => seat)
  if (mySeat === null) return seats
  return [...seats.slice(mySeat + 1), ...seats.slice(0, mySeat)]
}

/** Signed, so a count-down hand reads as taking off: +3, −3, 0. */
export function formatChange(change: number): string {
  if (change > 0) return `+${change}`
  if (change < 0) return `−${Math.abs(change)}`
  return '0'
}
