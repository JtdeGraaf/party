import { useTranslation } from 'react-i18next'
import type { GameScreenProps } from '@/games/game-screens'
import { namesBySeat } from '@/lib/seats'
import { seatsAfter } from './lib/table-layout'
import { hartenjagenRules } from './rules/hartenjagen-rules'

/** The kitchen table from the room's view: checked, with names by seat and the two moves a phone can make. */
export function useHearts({ room, gameView, sendMove }: GameScreenProps) {
  const { t } = useTranslation('hartenjagen')
  const parsed = hartenjagenRules.viewSchema.safeParse(gameView)
  if (!parsed.success) return null
  const view = parsed.data
  const names = namesBySeat(room)
  const mySeat = view.mine?.seat ?? null
  const nameOf = (seat: number) => (seat === mySeat ? t('table.you') : (names[seat] ?? ''))

  function headline(): string {
    const winners = view.score.winners
    if (winners.length > 1) return t('table.sharedWin', { names: winners.map(nameOf).join(' & ') })
    if (winners[0] === mySeat) return t('table.youWin')
    return t('table.winner', { name: nameOf(winners[0] ?? 0) })
  }

  return {
    view,
    names,
    mySeat,
    nameOf,
    others: seatsAfter(view.playerCount, mySeat),
    isMyTurn: view.turn !== null && view.turn === mySeat,
    isMyDeal: view.phase === 'betweenHands' && view.dealer === mySeat,
    winnerHeadline: view.phase === 'over' ? headline() : null,
    play: (card: string) => sendMove({ type: 'play', card }),
    deal: () => sendMove({ type: 'deal' }),
  }
}

export type HeartsOnScreen = NonNullable<ReturnType<typeof useHearts>>
