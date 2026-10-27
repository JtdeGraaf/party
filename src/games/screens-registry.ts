import type { GameScreens } from './game-screens'
import { dotsAndBoxesScreens } from './dotsandboxes/dotsandboxes-screens'
import { hartenjagenScreens } from './hartenjagen/hartenjagen-screens'

/** Every game on the shelf, in the order the shelf shows them. The app imports this; the server never does. */
export const GAME_SCREENS: readonly GameScreens[] = [hartenjagenScreens, dotsAndBoxesScreens]

export function screensFor(game: string): GameScreens | null {
  return GAME_SCREENS.find((screens) => screens.id === game) ?? null
}
