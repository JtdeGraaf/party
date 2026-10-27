import { useTranslation } from 'react-i18next'
import type { GameNamespace } from '@/i18n/resources'

/** A game's name in the current language, from the game's own translations. */
export function useGameName(game: GameNamespace): string {
  const { t } = useTranslation(game)
  return t('meta.name')
}
