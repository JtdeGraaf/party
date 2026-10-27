import { describe, expect, it } from 'vitest'
import { isGameProblem } from '../../../party/game-rules'
import { seededRandom, type Random } from '../../../party/random'
import { describeGameRules } from '../../../test/game-contract'
import { pointsOf } from './cards'
import { hartenjagenRules, type HartenjagenMove, type HartenjagenState } from './hartenjagen-rules'

function pickMove(state: HartenjagenState, random: Random): { seat: number; move: HartenjagenMove } {
  const table = hartenjagenRules.view(state, { as: 'table' })
  if (table.phase === 'betweenHands') return { seat: table.dealer, move: { type: 'deal' } }
  const seat = table.turn ?? 0
  const playable = hartenjagenRules.view(state, { as: 'seat', seat }).mine?.playable ?? []
  return { seat, move: { type: 'play', card: playable[random.below(playable.length)] } }
}

describeGameRules(hartenjagenRules, { settings: {}, pickMove })

const start = (seats: number) => hartenjagenRules.start({ seats, settings: {}, gameNumber: 1, random: seededRandom(3), now: 0 }).state

function play(state: HartenjagenState, seat: number, move: HartenjagenMove): HartenjagenState {
  const result = hartenjagenRules.move(state, { seat, move, random: seededRandom(4), now: 0 })
  if (isGameProblem(result)) throw new Error(result.problem)
  return result.state
}

/** Plays every card of the current hand with random legal moves. */
function playOutHand(state: HartenjagenState): HartenjagenState {
  const random = seededRandom(9)
  let current = state
  while (hartenjagenRules.view(current, { as: 'table' }).phase === 'playing') {
    const { seat, move } = pickMove(current, random)
    current = play(current, seat, move)
  }
  return current
}

describe('what each phone sees', () => {
  it('shows a seated player only their own cards', () => {
    const state = start(4)

    const views = [0, 1, 2, 3].map((seat) => hartenjagenRules.view(state, { as: 'seat', seat }))

    views.forEach((view, seat) => {
      expect(view.mine?.cards.sort()).toEqual([...state.hands[0].deal.hands[seat]].sort())
      const othersCards = state.hands[0].deal.hands.filter((_, other) => other !== seat).flat()
      const text = JSON.stringify(view)
      expect(othersCards.filter((card) => text.includes(`"${card}"`))).toEqual([])
    })
  })

  it('shows the table screen and watchers no hand at all, and the stok face down', () => {
    const state = start(5)
    const everyHeldCard = [...state.hands[0].deal.hands.flat(), ...state.hands[0].deal.stock]

    for (const viewer of [{ as: 'table' as const }, { as: 'watcher' as const }]) {
      const view = hartenjagenRules.view(state, viewer)
      const text = JSON.stringify(view)
      expect(view.mine).toBeNull()
      expect(view.stock).toEqual({ count: 2, takenBy: null, cards: null })
      expect(everyHeldCard.filter((card) => text.includes(`"${card}"`))).toEqual([])
    }
  })

  it('keeps the stok points hidden until the hand is done', () => {
    let state = start(5)
    const random = seededRandom(2)
    for (let card = 0; card < 5; card++) {
      const { seat, move } = pickMove(state, random)
      state = play(state, seat, move)
    }
    const view = hartenjagenRules.view(state, { as: 'table' })
    const firstTrickPoints = (view.trick?.cards ?? []).reduce((total, { card }) => total + pointsOf(card), 0)

    expect(view.stock.takenBy).toBe(view.trick?.takenBy)
    expect(view.pointsThisHand.reduce((total, points) => total + points, 0)).toBe(firstTrickPoints)
  })

  it('turns the stok over once the hand is done', () => {
    const state = playOutHand(start(5))

    expect(hartenjagenRules.view(state, { as: 'table' }).stock.cards).toEqual(state.hands[0].deal.stock)
  })
})

describe('moves', () => {
  it('refuses a card out of turn and a card the player does not hold', () => {
    const state = start(4)
    const table = hartenjagenRules.view(state, { as: 'table' })
    const leader = table.turn ?? 0
    const someoneElse = (leader + 1) % 4
    const othersCard = state.hands[0].deal.hands[someoneElse][0]

    const outOfTurn = hartenjagenRules.move(state, { seat: someoneElse, move: { type: 'play', card: othersCard }, random: seededRandom(1), now: 0 })
    const notHeld = hartenjagenRules.move(state, { seat: leader, move: { type: 'play', card: othersCard }, random: seededRandom(1), now: 0 })

    expect(outOfTurn).toEqual({ problem: 'notYourTurn' })
    expect(notHeld).toEqual({ problem: 'cannotPlayThat' })
  })

  it('lets only the next dealer deal, and only once the hand is done', () => {
    const state = start(4)
    const random = seededRandom(1)

    expect(hartenjagenRules.move(state, { seat: 1, move: { type: 'deal' }, random, now: 0 })).toEqual({ problem: 'handInPlay' })

    const done = playOutHand(state)
    const table = hartenjagenRules.view(done, { as: 'table' })
    const notDealer = (table.dealer + 1) % 4

    expect(table).toMatchObject({ phase: 'betweenHands', handNumber: 2, dealer: 1 })
    expect(hartenjagenRules.move(done, { seat: notDealer, move: { type: 'deal' }, random, now: 0 })).toEqual({
      problem: 'notYourDeal',
    })
    expect(hartenjagenRules.view(play(done, table.dealer, { type: 'deal' }), { as: 'table' })).toMatchObject({
      phase: 'playing',
      handNumber: 2,
    })
  })

  it('scores a finished hand on the pad', () => {
    const done = playOutHand(start(4))

    const { score } = hartenjagenRules.view(done, { as: 'table' })

    expect(score.hands).toHaveLength(1)
    expect(score.totals.reduce((total, points) => total + points, 0)).toBeGreaterThanOrEqual(15)
  })
})
