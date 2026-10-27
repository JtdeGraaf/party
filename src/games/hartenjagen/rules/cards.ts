/** The 32-card deck, 7 to ace in four suits, and what each card is worth. */
export const SUITS = ['clubs', 'diamonds', 'spades', 'hearts'] as const
export const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const

export type Suit = (typeof SUITS)[number]
export type Rank = (typeof RANKS)[number]
export type Card = { suit: Suit; rank: Rank }

const SUIT_LETTERS: Record<Suit, string> = { clubs: 'C', diamonds: 'D', spades: 'S', hearts: 'H' }

/** Cards travel as short ids: `QS` is the queen of spades, `10H` the ten of hearts. */
export function cardId({ suit, rank }: Card): string {
  return `${rank}${SUIT_LETTERS[suit]}`
}

/** The card an id names, or null when it isn't one of the 32. */
export function readCard(id: string): Card | null {
  const match = /^(7|8|9|10|J|Q|K|A)([CDSH])$/.exec(id)
  if (!match) return null
  const suit = SUITS.find((candidate) => SUIT_LETTERS[candidate] === match[2])
  if (!suit) return null
  return { suit, rank: match[1] as Rank }
}

export const FULL_DECK: readonly string[] = SUITS.flatMap((suit) => RANKS.map((rank) => cardId({ suit, rank })))

export const BLACK_LADY = 'QS'
export const CLUBS_JACK = 'JC'

/** Penalty points: every heart 1, the black lady 5, the clubs jack 2. */
export function pointsOf(id: string): number {
  if (id === BLACK_LADY) return 5
  if (id === CLUBS_JACK) return 2
  return readCard(id)?.suit === 'hearts' ? 1 : 0
}

export const POINTS_PER_HAND = FULL_DECK.reduce((total, id) => total + pointsOf(id), 0)

/** Hearts and diamonds are printed red, clubs and spades black. */
export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds'
}

export function suitOf(id: string): Suit | null {
  return readCard(id)?.suit ?? null
}

/** Higher beats lower within a suit. */
export function rankOrder(id: string): number {
  const card = readCard(id)
  return card ? RANKS.indexOf(card.rank) : -1
}

/** A hand sorted the way people hold it: by suit, low to high. */
export function sortHand(cards: readonly string[]): string[] {
  return [...cards].sort((first, second) => {
    const bySuit = SUITS.indexOf(suitOf(first) ?? 'clubs') - SUITS.indexOf(suitOf(second) ?? 'clubs')
    return bySuit || rankOrder(first) - rankOrder(second)
  })
}
