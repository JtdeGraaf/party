import type { GameScreens } from '@/games/game-screens'
import { DotsEmblem, DotsRules, DotsSettings } from './components/DotsExtras'
import { DotsPhone } from './components/DotsPhone'
import { DotsTable } from './components/DotsTable'
import { dotsAndBoxesRules } from './rules/dotsandboxes-rules'

export const dotsAndBoxesScreens: GameScreens = {
  id: 'dotsandboxes',
  players: dotsAndBoxesRules.players,
  defaultSettings: dotsAndBoxesRules.defaultSettings,
  worldClass: 'world-dotsandboxes',
  Emblem: DotsEmblem,
  Rules: DotsRules,
  Settings: DotsSettings,
  Phone: DotsPhone,
  Table: DotsTable,
}
