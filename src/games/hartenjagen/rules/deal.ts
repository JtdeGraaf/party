import { shuffled, type Random } from '../../../party/random'
import { FULL_DECK } from './cards'

export type PlayerCount = 4 | 5

export const PLAYER_COUNTS: readonly PlayerCount[] = [4, 5]

export function isPlayerCount(value: number): value is PlayerCount {
  return PLAYER_COUNTS.includes(value as PlayerCount)
}

/** Four players get 8 cards each. Five get 6, and the 2 left over lie face down as the stok. */
export type Deal = { hands: string[][]; stock: string[] }

export function cardsPerPlayer(players: PlayerCount): number {
  return players === 4 ? 8 : 6
}

/** Shuffles the 32 cards and deals them out. */
export function dealCards(players: PlayerCount, random: Random): Deal {
  const deck = shuffled(FULL_DECK, random)
  const perPlayer = cardsPerPlayer(players)
  const hands = Array.from({ length: players }, (_, seat) => deck.slice(seat * perPlayer, (seat + 1) * perPlayer))
  return { hands, stock: deck.slice(players * perPlayer) }
}

/** Who deals each hand, counting hands from 1: the deal moves one seat on each time. */
export function dealerOf(handNumber: number, players: PlayerCount): number {
  return (handNumber - 1) % players
}

/** The player after the dealer leads the first trick. */
export function firstLeaderOf(handNumber: number, players: PlayerCount): number {
  return (dealerOf(handNumber, players) + 1) % players
}
