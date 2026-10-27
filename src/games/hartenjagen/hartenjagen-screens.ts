import type { GameScreens } from '@/games/game-screens'
import { HeartsEmblem, HeartsRules } from './components/HeartsExtras'
import { HeartsPhone } from './components/HeartsPhone'
import { HeartsTable } from './components/HeartsTable'
import { Oilcloth } from './components/Oilcloth'
import { hartenjagenRules } from './rules/hartenjagen-rules'

export const hartenjagenScreens: GameScreens = {
  id: 'hartenjagen',
  players: hartenjagenRules.players,
  defaultSettings: hartenjagenRules.defaultSettings,
  worldClass: 'world-hartenjagen',
  Backdrop: Oilcloth,
  Emblem: HeartsEmblem,
  Rules: HeartsRules,
  Phone: HeartsPhone,
  Table: HeartsTable,
}
