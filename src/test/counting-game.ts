import { z } from 'zod'
import type { GameRules } from '@/party/game-rules'

/**
 * A tiny game for testing the room: seats take turns adding to a shared count until it reaches the target. Each
 * seat also holds a secret number nobody else may see, and the table screen sees no secrets at all.
 */
const stateSchema = z.object({
  count: z.number(),
  target: z.number(),
  turn: z.number(),
  secrets: z.array(z.number()),
})

type CountingState = z.infer<typeof stateSchema>

const viewSchema = z.object({
  count: z.number(),
  turn: z.number(),
  seats: z.number(),
  mySecret: z.number().nullable(),
})

export const countingGame: GameRules<CountingState, { add: number }, { target: number }, z.infer<typeof viewSchema>> = {
  id: 'counting',
  players: { min: 2, max: 3 },
  joinsMidGame: false,
  settingsSchema: z.object({ target: z.number().int().min(1).max(20) }),
  defaultSettings: { target: 5 },
  moveSchema: z.object({ add: z.number().int().min(1).max(2) }),
  stateSchema,
  viewSchema,
  start({ seats, settings, random }) {
    return {
      state: { count: 0, target: settings.target, turn: 0, secrets: Array.from({ length: seats }, () => random.below(1000)) },
    }
  },
  move(state, { seat, move }) {
    if (state.count >= state.target) return { problem: 'over' }
    if (seat !== state.turn) return { problem: 'notYourTurn' }
    return {
      state: { ...state, count: state.count + move.add, turn: (state.turn + 1) % state.secrets.length },
    }
  },
  view(state, viewer) {
    return {
      count: state.count,
      turn: state.turn,
      seats: state.secrets.length,
      mySecret: viewer.as === 'seat' ? state.secrets[viewer.seat] : null,
    }
  },
  isOver(state) {
    return state.count >= state.target
  },
}
