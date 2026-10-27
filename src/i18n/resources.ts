import dotsAndBoxesEn from '@/games/dotsandboxes/i18n/en.json'
import dotsAndBoxesNl from '@/games/dotsandboxes/i18n/nl.json'
import hartenjagenEn from '@/games/hartenjagen/i18n/en.json'
import hartenjagenNl from '@/games/hartenjagen/i18n/nl.json'
import en from './locales/en/translation.json'
import nl from './locales/nl/translation.json'

/** The hub's own texts, plus one namespace per game, named after the game's id. */
export const resources = {
  en: { translation: en, hartenjagen: hartenjagenEn, dotsandboxes: dotsAndBoxesEn },
  nl: { translation: nl, hartenjagen: hartenjagenNl, dotsandboxes: dotsAndBoxesNl },
} as const

export type GameNamespace = Exclude<keyof (typeof resources)['en'], 'translation'>
