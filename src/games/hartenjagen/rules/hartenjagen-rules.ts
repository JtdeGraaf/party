import { z } from 'zod'
import type { GameProblem, GameRules, Outcome, Viewer } from '../../../party/game-rules'
import { pointsOf, sortHand } from './cards'
import { dealCards, dealerOf, firstLeaderOf, isPlayerCount, type Deal, type PlayerCount } from './deal'
import { playableCards, playHand, type HandState, type Trick } from './hand'
import { scoreHands, type ScorePad } from './scoring'

const playSchema = z.object({ number: z.number().int().nonnegative(), card: z.string(), seat: z.number().int() })
const dealSchema = z.object({ hands: z.array(z.array(z.string())), stock: z.array(z.string()) })

/** The whole game is its deals and the cards played on them; everything else is worked out by replaying. */
const stateSchema = z.object({
  stateVersion: z.literal(1),
  players: z.union([z.literal(4), z.literal(5)]),
  /** Every hand so far, from hand 1; the last one may still be in play. */
  hands: z.array(z.object({ deal: dealSchema, plays: z.array(playSchema) })),
})

export type HartenjagenState = z.infer<typeof stateSchema>

const moveSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('play'), card: z.string() }),
  z.object({ type: z.literal('deal') }),
])

export type HartenjagenMove = z.infer<typeof moveSchema>

const settingsSchema = z.object({})

const trickSchema = z.object({
  leader: z.number(),
  cards: z.array(z.object({ seat: z.number(), card: z.string() })),
  /** Set while a finished trick still lies on the table, before the next card lands. */
  takenBy: z.number().nullable(),
})

const scoredHandSchema = z.object({
  taken: z.array(z.number()),
  change: z.array(z.number()),
  totals: z.array(z.number()),
  direction: z.enum(['up', 'down']),
  allPointsBy: z.number().nullable(),
})

const viewSchema = z.object({
  playerCount: z.union([z.literal(4), z.literal(5)]),
  phase: z.enum(['playing', 'betweenHands', 'over']),
  /** The hand on the table, or the one the dealer is about to deal, counting from 1. */
  handNumber: z.number(),
  dealer: z.number(),
  turn: z.number().nullable(),
  trick: trickSchema.nullable(),
  /** How many tricks are done this hand, so a screen can tell a new trick from the last one. */
  tricksDone: z.number(),
  cardsLeft: z.array(z.number()),
  /** Penalty points taken this hand from tricks everyone saw; the stok joins once the hand is done. */
  pointsThisHand: z.array(z.number()),
  stock: z.object({ count: z.number(), takenBy: z.number().nullable(), cards: z.array(z.string()).nullable() }),
  score: z.object({
    hands: z.array(scoredHandSchema),
    totals: z.array(z.number()),
    nextDirection: z.enum(['up', 'down']),
    winners: z.array(z.number()),
  }),
  /** Only for a seated player: their own cards. Nobody else's hand is ever in a view. */
  mine: z.object({ seat: z.number(), cards: z.array(z.string()), playable: z.array(z.string()) }).nullable(),
})

export type HartenjagenView = z.infer<typeof viewSchema>

export const HARTENJAGEN_PROBLEMS = ['notYourTurn', 'cannotPlayThat', 'notYourDeal', 'handInPlay', 'gameOver'] as const
type HartenjagenProblem = (typeof HARTENJAGEN_PROBLEMS)[number]

function refuse(problem: HartenjagenProblem): GameProblem {
  return { problem }
}

/** Jt's house rules for Dutch Hearts, for 4 or 5 players: see the README for the full rules. */
export const hartenjagenRules: GameRules<HartenjagenState, HartenjagenMove, z.infer<typeof settingsSchema>, HartenjagenView> =
  {
    id: 'hartenjagen',
    players: { min: 4, max: 5 },
    joinsMidGame: false,
    settingsSchema,
    defaultSettings: {},
    moveSchema,
    stateSchema,
    viewSchema,

    start({ seats, random }) {
      if (!isPlayerCount(seats)) throw new RangeError(`hartenjagen seats 4 or 5, not ${seats}`)
      return { state: { stateVersion: 1, players: seats, hands: [{ deal: dealCards(seats, random), plays: [] }] } }
    },

    move(state, { seat, move, random }) {
      const table = replay(state)
      if (table.score.winners.length > 0) return refuse('gameOver')
      if (move.type === 'deal') return dealNextHand(state, table, seat, random)
      return playCard(state, table, seat, move.card)
    },

    view(state, viewer) {
      return viewOf(replay(state), viewer)
    },

    isOver(state) {
      return replay(state).score.winners.length > 0
    },
  }

type Replayed = {
  players: PlayerCount
  /** The last hand dealt, replayed. */
  current: { deal: Deal; hand: HandState }
  handNumber: number
  score: ScorePad
}

function replay(state: HartenjagenState): Replayed {
  const replayed = state.hands.map(({ deal, plays }, index) => ({
    deal,
    hand: playHand(deal, firstLeaderOf(index + 1, state.players), plays),
  }))
  const finished = replayed.filter(({ hand }) => hand.turn === null).map(({ hand }) => hand.points)
  return {
    players: state.players,
    current: replayed[replayed.length - 1],
    handNumber: replayed.length,
    score: scoreHands(finished, state.players),
  }
}

function playCard(state: HartenjagenState, table: Replayed, seat: number, card: string): Outcome<HartenjagenState> | GameProblem {
  const { hand } = table.current
  if (hand.turn !== seat) return refuse('notYourTurn')
  if (!playableCards(hand.holding[seat], hand.currentTrick).includes(card)) return refuse('cannotPlayThat')

  const hands = state.hands.map((entry, index) =>
    index === state.hands.length - 1
      ? { ...entry, plays: [...entry.plays, { number: hand.nextPlayNumber, card, seat }] }
      : entry,
  )
  return { state: { ...state, hands } }
}

function dealNextHand(
  state: HartenjagenState,
  table: Replayed,
  seat: number,
  random: Parameters<typeof dealCards>[1],
): Outcome<HartenjagenState> | GameProblem {
  if (table.current.hand.turn !== null) return refuse('handInPlay')
  if (dealerOf(table.handNumber + 1, state.players) !== seat) return refuse('notYourDeal')
  return { state: { ...state, hands: [...state.hands, { deal: dealCards(state.players, random), plays: [] }] } }
}

function viewOf(table: Replayed, viewer: Viewer): HartenjagenView {
  const { players, current, score } = table
  const { hand, deal } = current
  const isHandDone = hand.turn === null
  const phase = score.winners.length > 0 ? 'over' : isHandDone ? 'betweenHands' : 'playing'
  const handNumber = phase === 'betweenHands' ? table.handNumber + 1 : table.handNumber
  const stockPoints = deal.stock.reduce((total, card) => total + pointsOf(card), 0)

  return {
    playerCount: players,
    phase,
    handNumber,
    dealer: dealerOf(handNumber, players),
    turn: hand.turn,
    trick: isHandDone ? lastTrick(hand) : trickOnTable(hand),
    tricksDone: hand.finishedTricks.length,
    cardsLeft: hand.holding.map((cards) => cards.length),
    pointsThisHand: hand.points.map((points, seat) =>
      !isHandDone && seat === hand.stockTakenBy ? points - stockPoints : points,
    ),
    stock: {
      count: deal.stock.length,
      takenBy: hand.stockTakenBy,
      cards: isHandDone && deal.stock.length > 0 ? deal.stock : null,
    },
    score,
    mine: viewer.as === 'seat' ? mineOf(hand, viewer.seat) : null,
  }
}

function mineOf(hand: HandState, seat: number): HartenjagenView['mine'] {
  const cards = sortHand(hand.holding[seat] ?? [])
  return { seat, cards, playable: hand.turn === seat ? playableCards(cards, hand.currentTrick) : [] }
}

/** The trick in the middle; between tricks the last one stays visible with who took it, until the next card lands. */
function trickOnTable(hand: HandState): HartenjagenView['trick'] {
  if (hand.currentTrick.cards.length > 0 || hand.finishedTricks.length === 0) return withTaker(hand.currentTrick, null)
  return lastTrick(hand)
}

function lastTrick(hand: HandState): HartenjagenView['trick'] {
  const last = hand.finishedTricks[hand.finishedTricks.length - 1]
  return last ? withTaker(last, last.winner) : null
}

function withTaker(trick: Trick, takenBy: number | null): NonNullable<HartenjagenView['trick']> {
  return { leader: trick.leader, cards: trick.cards, takenBy }
}
