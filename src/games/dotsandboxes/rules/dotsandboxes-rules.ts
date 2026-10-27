import { z } from 'zod'
import type { GameProblem, GameRules } from '../../../party/game-rules'
import { BOARD_SIZES, readLine, type BoardSize } from './board'
import { playRound } from './round'

const boardSizeSchema = z.union(BOARD_SIZES.map((size) => z.literal(size))) as z.ZodType<BoardSize>

const settingsSchema = z.object({ size: boardSizeSchema })

export type DotsAndBoxesSettings = z.infer<typeof settingsSchema>

/** A round is its board, who starts, and every line drawn; scores and turns come from replaying them. */
const stateSchema = z.object({
  stateVersion: z.literal(1),
  size: boardSizeSchema,
  seats: z.number().int().min(2).max(4),
  firstTurn: z.number().int().nonnegative(),
  moves: z.array(z.object({ number: z.number().int().nonnegative(), line: z.string(), seat: z.number().int() })),
})

export type DotsAndBoxesState = z.infer<typeof stateSchema>

const moveSchema = z.object({ line: z.string() })

export type DotsAndBoxesMove = z.infer<typeof moveSchema>

/** There is nothing secret in dots and boxes: everyone sees the whole quilt, and a seat also learns which it is. */
const viewSchema = z.object({
  size: boardSizeSchema,
  seats: z.number(),
  drawnLines: z.record(z.string(), z.number()),
  boxOwners: z.record(z.string(), z.number()),
  boxStitch: z.record(z.string(), z.number()),
  scores: z.array(z.number()),
  turn: z.number().nullable(),
  winners: z.array(z.number()),
  lastLine: z.string().nullable(),
  mySeat: z.number().nullable(),
})

export type DotsAndBoxesView = z.infer<typeof viewSchema>

export const DOTS_AND_BOXES_PROBLEMS = ['notYourTurn', 'notALine', 'lineTaken', 'gameOver'] as const
type DotsAndBoxesProblem = (typeof DOTS_AND_BOXES_PROBLEMS)[number]

function refuse(problem: DotsAndBoxesProblem): GameProblem {
  return { problem }
}

export const dotsAndBoxesRules: GameRules<DotsAndBoxesState, DotsAndBoxesMove, DotsAndBoxesSettings, DotsAndBoxesView> =
  {
    id: 'dotsandboxes',
    players: { min: 2, max: 4 },
    joinsMidGame: false,
    settingsSchema,
    defaultSettings: { size: 4 },
    moveSchema,
    stateSchema,
    viewSchema,

    // Each new game in a room is started by the next seat along.
    start({ seats, settings, gameNumber }) {
      return { state: { stateVersion: 1, size: settings.size, seats, firstTurn: (gameNumber - 1) % seats, moves: [] } }
    },

    move(state, { seat, move }) {
      const round = playRound(state)
      if (round.turn === null) return refuse('gameOver')
      if (round.turn !== seat) return refuse('notYourTurn')
      if (!readLine(move.line, state.size)) return refuse('notALine')
      if (move.line in round.drawnLines) return refuse('lineTaken')
      return { state: { ...state, moves: [...state.moves, { number: state.moves.length, line: move.line, seat }] } }
    },

    view(state, viewer) {
      const round = playRound(state)
      return {
        size: state.size,
        seats: state.seats,
        ...round,
        mySeat: viewer.as === 'seat' ? viewer.seat : null,
      }
    },

    isOver(state) {
      return playRound(state).turn === null
    },
  }
