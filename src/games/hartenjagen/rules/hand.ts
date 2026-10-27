import { pointsOf, rankOrder, suitOf } from './cards'
import type { Deal } from './deal'

/** One card laid on the table. Plays are numbered from 0 within a hand. */
export type Play = { number: number; card: string; seat: number }

export type Trick = { leader: number; cards: { seat: number; card: string }[]; winner: number | null }

export type HandState = {
  /** Cards still held, per seat. */
  holding: string[][]
  finishedTricks: Trick[]
  /** The trick on the table now; empty cards between tricks. */
  currentTrick: Trick
  /** Whose turn it is, or null once every card is played. */
  turn: number | null
  /** Penalty points taken so far, per seat, the stok included. */
  points: number[]
  /** Who took the stok with the first trick, or null while the first trick is on the table or with four players. */
  stockTakenBy: number | null
  nextPlayNumber: number
}

/**
 * Replays a hand's plays in order. Anyone with the code can write to the table, so a play out of turn, a card the
 * player doesn't hold, or a card that fails to follow suit is skipped instead of trusted.
 */
export function playHand(deal: Deal, firstLeader: number, plays: readonly Play[]): HandState {
  const seats = deal.hands.length
  const holding = deal.hands.map((hand) => [...hand])
  const points = deal.hands.map(() => 0)
  const finishedTricks: Trick[] = []
  let currentTrick: Trick = { leader: firstLeader, cards: [], winner: null }
  let stockTakenBy: number | null = null
  let nextPlayNumber = 0

  for (const play of [...plays].sort((first, second) => first.number - second.number)) {
    nextPlayNumber = Math.max(nextPlayNumber, play.number + 1)
    const turn = (currentTrick.leader + currentTrick.cards.length) % seats
    if (holding.every((cards) => cards.length === 0)) break
    if (play.seat !== turn || !canPlay(holding[turn], play.card, ledSuitOf(currentTrick))) continue

    holding[turn] = holding[turn].filter((card) => card !== play.card)
    currentTrick = { ...currentTrick, cards: [...currentTrick.cards, { seat: turn, card: play.card }] }
    if (currentTrick.cards.length < seats) continue

    const winner = winnerOf(currentTrick)
    points[winner] += currentTrick.cards.reduce((total, { card }) => total + pointsOf(card), 0)
    if (finishedTricks.length === 0 && deal.stock.length > 0) {
      stockTakenBy = winner
      points[winner] += deal.stock.reduce((total, card) => total + pointsOf(card), 0)
    }
    finishedTricks.push({ ...currentTrick, winner })
    currentTrick = { leader: winner, cards: [], winner: null }
  }

  const isDone = holding.every((cards) => cards.length === 0)
  return {
    holding,
    finishedTricks,
    currentTrick,
    turn: isDone ? null : (currentTrick.leader + currentTrick.cards.length) % seats,
    points,
    stockTakenBy,
    nextPlayNumber,
  }
}

/** The cards a player may lay: the led suit if they have it, anything otherwise. */
export function playableCards(holding: readonly string[], trick: Trick): string[] {
  return holding.filter((card) => canPlay(holding, card, ledSuitOf(trick)))
}

function canPlay(holding: readonly string[], card: string, ledSuit: string | null): boolean {
  if (!holding.includes(card)) return false
  if (ledSuit === null) return true
  const canFollow = holding.some((held) => suitOf(held) === ledSuit)
  return !canFollow || suitOf(card) === ledSuit
}

function ledSuitOf(trick: Trick): string | null {
  const first = trick.cards[0]
  return first ? suitOf(first.card) : null
}

/** The highest card of the led suit takes the trick; there are no trumps. */
function winnerOf(trick: Trick): number {
  const ledSuit = ledSuitOf(trick)
  const following = trick.cards.filter(({ card }) => suitOf(card) === ledSuit)
  const best = following.reduce((highest, play) => (rankOrder(play.card) > rankOrder(highest.card) ? play : highest))
  return best.seat
}
