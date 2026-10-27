import type { z } from 'zod'
import type { Random } from './random'

/**
 * Who is looking: the table screen (a TV or laptop everyone can see), one of the seated players, or someone in the
 * room who doesn't play this game.
 */
export type Viewer = { as: 'table' } | { as: 'seat'; seat: number } | { as: 'watcher' }

/** A game's state after something happened, and when the game wants to be woken up next (ms since 1970). */
export type Outcome<State> = { state: State; wakeAt?: number }

/** A move the rules refuse. `problem` has a `<game>:errors.<problem>` text in every language. */
export type GameProblem = { problem: string; args?: (string | number)[] }

export type StartContext<Settings> = {
  seats: number
  settings: Settings
  /** How many games this room has started, this one included, so a game can let someone else begin each time. */
  gameNumber: number
  random: Random
  now: number
}
export type MoveContext<Move> = { seat: number; move: Move; random: Random; now: number }
export type WakeContext = { random: Random; now: number }

/**
 * Everything the room needs from a game. The room seats people, passes their moves in, stores the state, runs
 * wake-ups and hands out views; turns, cards, boards, scores and secrets are all the game's business.
 *
 * Rules are pure: the same state, move, random numbers and time always give the same outcome.
 */
export type GameRules<State, Move, Settings, View> = {
  id: string
  players: { min: number; max: number }
  /** Whether someone can take a seat after the game started (a quiz could, a card game can't). */
  joinsMidGame: boolean
  settingsSchema: z.ZodType<Settings>
  defaultSettings: Settings
  moveSchema: z.ZodType<Move>
  /** State read back from storage is checked against this, not trusted. */
  stateSchema: z.ZodType<State>
  /** Views are checked against this on the phone, the same as every other message from the server. */
  viewSchema: z.ZodType<View>
  start(context: StartContext<Settings>): Outcome<State>
  /** Any seat may send a move at any time; the game decides whose turn it is, or that everyone moves at once. */
  move(state: State, context: MoveContext<Move>): Outcome<State> | GameProblem
  /** Called once the time a game asked for in `wakeAt` has come: countdowns, reveals, an automatic next round. */
  wake?(state: State, context: WakeContext): Outcome<State>
  /** Only for games that join mid-game: the new seat is the next number up. */
  seatAdded?(state: State, context: { seat: number }): Outcome<State>
  /** What each kind of viewer may see. Anything left out here never leaves the server. */
  view(state: State, viewer: Viewer): View
  /** A finished game shows its results and offers to play again. */
  isOver(state: State): boolean
}

// Method shorthand in GameRules makes this assignable from any concrete game's rules.
export type AnyGameRules = GameRules<unknown, unknown, unknown, unknown>

export function isGameProblem<State>(result: Outcome<State> | GameProblem): result is GameProblem {
  return 'problem' in result
}
