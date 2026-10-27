import { describe, expect, it } from 'vitest'
import { FULL_DECK, POINTS_PER_HAND, pointsOf, readCard, sortHand } from './cards'
import { dealCards, dealerOf, firstLeaderOf, type Deal } from './deal'
import { playableCards, playHand, type Play } from './hand'
import { scoreHands } from './scoring'
import type { Random } from '../../../party/random'

/** Always picks the last remaining card, so the shuffle leaves the deck in its original order. */
const noShuffle: Random = { below: (size) => size - 1 }

function plays(...cards: [number, string][]): Play[] {
  return cards.map(([seat, card], number) => ({ number, seat, card }))
}

describe('the deck', () => {
  it('has 32 cards from 7 to ace', () => {
    expect(FULL_DECK).toHaveLength(32)
    expect(new Set(FULL_DECK).size).toBe(32)
    expect(readCard('10H')).toEqual({ suit: 'hearts', rank: '10' })
    expect(readCard('6H')).toBeNull()
  })

  it('makes hearts 1, the black lady 5 and the clubs jack 2, so 15 a hand', () => {
    expect([pointsOf('7H'), pointsOf('AH'), pointsOf('QS'), pointsOf('JC'), pointsOf('QC'), pointsOf('KS')]).toEqual([
      1, 1, 5, 2, 0, 0,
    ])
    expect(POINTS_PER_HAND).toBe(15)
  })

  it('sorts a hand by suit, then low to high', () => {
    expect(sortHand(['AH', '7C', 'QS', '10C', '8D'])).toEqual(['7C', '10C', '8D', 'QS', 'AH'])
  })
})

describe('dealing', () => {
  it('gives four players 8 cards each and no stok', () => {
    const deal = dealCards(4, noShuffle)

    expect(deal.hands.map((hand) => hand.length)).toEqual([8, 8, 8, 8])
    expect(deal.stock).toEqual([])
  })

  it('gives five players 6 cards each and leaves 2 as the stok', () => {
    const deal = dealCards(5, noShuffle)

    expect(deal.hands.map((hand) => hand.length)).toEqual([6, 6, 6, 6, 6])
    expect(deal.stock).toHaveLength(2)
    expect(new Set([...deal.hands.flat(), ...deal.stock]).size).toBe(32)
  })

  it('moves the deal one seat each hand, and the player after the dealer leads', () => {
    expect([1, 2, 5, 6].map((hand) => dealerOf(hand, 5))).toEqual([0, 1, 4, 0])
    expect(firstLeaderOf(4, 4)).toBe(0)
  })
})

describe('playing a hand', () => {
  const deal: Deal = {
    hands: [
      ['7C', 'AH'],
      ['8C', 'QS'],
      ['9C', '7H'],
      ['JC', 'KH'],
    ],
    stock: [],
  }

  it('gives the trick to the highest card of the led suit, and that player leads next', () => {
    const state = playHand(deal, 0, plays([0, '7C'], [1, '8C'], [2, '9C'], [3, 'JC']))

    expect(state.finishedTricks[0].winner).toBe(3)
    expect(state.points).toEqual([0, 0, 0, 2])
    expect(state.turn).toBe(3)
  })

  it('lets a player who cannot follow suit throw anything, and that card never wins', () => {
    const afterFirst = plays([0, '7C'], [1, '8C'], [2, '9C'], [3, 'JC'])
    const state = playHand(deal, 0, [
      ...afterFirst,
      ...plays([3, 'KH'], [0, 'AH'], [1, 'QS'], [2, '7H']).map((play) => ({ ...play, number: play.number + 4 })),
    ])

    expect(state.finishedTricks[1].winner).toBe(0)
    expect(state.points).toEqual([8, 0, 0, 2])
    expect(state.turn).toBeNull()
  })

  it('skips plays out of turn, cards not held, and cards that fail to follow suit', () => {
    const state = playHand(deal, 0, plays([1, '8C'], [0, 'KH'], [0, '7C'], [1, 'QS'], [1, '8C']))

    expect(state.currentTrick.cards).toEqual([
      { seat: 0, card: '7C' },
      { seat: 1, card: '8C' },
    ])
    expect(state.turn).toBe(2)
  })

  it('only offers cards of the led suit when the player has one', () => {
    expect(playableCards(['AH', '8C'], { leader: 0, cards: [{ seat: 0, card: '7C' }], winner: null })).toEqual(['8C'])
    expect(playableCards(['AH', 'QS'], { leader: 0, cards: [{ seat: 0, card: '7C' }], winner: null })).toEqual([
      'AH',
      'QS',
    ])
  })

  it('gives the stok to whoever wins the first trick, points and all', () => {
    const fivePlayers: Deal = { hands: [['7C'], ['8C'], ['9C'], ['10C'], ['AC']], stock: ['QS', 'AH'] }

    const state = playHand(fivePlayers, 0, plays([0, '7C'], [1, '8C'], [2, '9C'], [3, '10C'], [4, 'AC']))

    expect(state.stockTakenBy).toBe(4)
    expect(state.points).toEqual([0, 0, 0, 0, 6])
  })
})

describe('scoring', () => {
  it('counts up while nobody has reached 50', () => {
    const pad = scoreHands([[5, 3, 7, 0]], 4)

    expect(pad.totals).toEqual([5, 3, 7, 0])
    expect(pad.nextDirection).toBe('up')
    expect(pad.winners).toEqual([])
  })

  it('counts down from the hand after someone reaches 50, and the first to 0 wins', () => {
    const pad = scoreHands(
      [
        [15 - 2, 2, 0, 0],
        [13, 2, 0, 0],
        [13, 2, 0, 0],
        [13, 2, 0, 0],
        [0, 0, 8, 7],
      ],
      4,
    )

    expect(pad.hands[3].totals).toEqual([52, 8, 0, 0])
    expect(pad.hands[3].direction).toBe('up')
    expect(pad.hands[4].direction).toBe('down')
    expect(pad.hands[4].change).toEqual([-0, -0, -8, -7])
    expect(pad.winners).toEqual([2])
  })

  it('gives everyone else the 15 when one player takes every point', () => {
    const pad = scoreHands([[0, 15, 0, 0]], 4)

    expect(pad.hands[0].allPointsBy).toBe(1)
    expect(pad.totals).toEqual([15, 0, 15, 15])
  })

  it('subtracts the 15 from everyone else when it happens while counting down', () => {
    const pad = scoreHands(
      [
        [0, 0, 0, 15],
        [0, 0, 0, 15],
        [0, 0, 0, 15],
        [0, 0, 0, 15],
        [15, 0, 0, 0],
      ],
      4,
    )

    expect(pad.hands[3].totals).toEqual([60, 60, 60, 0])
    expect(pad.hands[4].change).toEqual([-0, -15, -15, -15])
    expect(pad.totals).toEqual([60, 45, 45, -15])
    expect(pad.winners).toEqual([3])
  })

  it('names everyone on the lowest score when more than one reaches 0 in the same hand', () => {
    const pad = scoreHands(
      [
        [50, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      4,
    )

    expect(pad.hands[1].direction).toBe('down')
    expect(pad.winners).toEqual([1, 2, 3])
  })
})
