import type { AnyGameRules } from '../party/game-rules'
import { dotsAndBoxesRules } from './dotsandboxes/rules/dotsandboxes-rules'
import { hartenjagenRules } from './hartenjagen/rules/hartenjagen-rules'

/** Every game the room server can run, by id. The server imports this; no React, no screens. */
export const GAME_RULES: Readonly<Record<string, AnyGameRules>> = {
  [hartenjagenRules.id]: hartenjagenRules as AnyGameRules,
  [dotsAndBoxesRules.id]: dotsAndBoxesRules as AnyGameRules,
}

export function rulesFor(game: string): AnyGameRules | null {
  return Object.hasOwn(GAME_RULES, game) ? GAME_RULES[game] : null
}
