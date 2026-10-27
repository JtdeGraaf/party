import { POINTS_PER_HAND } from './cards'

/** Scores count up until someone reaches this, then count down from the next hand. */
export const COUNT_UP_TO = 50

export type Direction = 'up' | 'down'

export type ScoredHand = {
  /** Points each seat took in the hand, before the all-points rule. */
  taken: number[]
  /** What the hand did to each score: positive while counting up, negative while counting down. */
  change: number[]
  totals: number[]
  direction: Direction
  /** The seat that took every point, when someone did. */
  allPointsBy: number | null
}

export type ScorePad = {
  hands: ScoredHand[]
  totals: number[]
  /** How the next hand will count. */
  nextDirection: Direction
  /** Seats that won, once the game is over; more than one on a draw. */
  winners: number[]
}

/**
 * Adds up finished hands. A player who takes all 15 points scores nothing that hand and everyone else gets the 15.
 * Once anyone reaches 50, every later hand counts down, and the game ends when someone reaches 0: the lowest score
 * wins.
 */
export function scoreHands(takenPerHand: readonly number[][], players: number): ScorePad {
  const hands: ScoredHand[] = []
  let totals = Array.from({ length: players }, () => 0)
  let direction: Direction = 'up'

  for (const taken of takenPerHand) {
    const allPointsBy = taken.findIndex((points) => points === POINTS_PER_HAND)
    const points = allPointsBy === -1 ? taken : taken.map((_, seat) => (seat === allPointsBy ? 0 : POINTS_PER_HAND))
    const change = points.map((value) => (direction === 'up' ? value : -value))
    totals = totals.map((total, seat) => total + change[seat])
    hands.push({ taken: [...taken], change, totals, direction, allPointsBy: allPointsBy === -1 ? null : allPointsBy })

    if (direction === 'down' && totals.some((total) => total <= 0)) {
      return { hands, totals, nextDirection: direction, winners: lowest(totals) }
    }
    if (direction === 'up' && totals.some((total) => total >= COUNT_UP_TO)) direction = 'down'
  }

  return { hands, totals, nextDirection: direction, winners: [] }
}

function lowest(totals: number[]): number[] {
  const best = Math.min(...totals)
  return totals.flatMap((total, seat) => (total === best ? [seat] : []))
}
