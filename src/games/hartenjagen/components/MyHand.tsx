import { Button as BaseButton } from '@base-ui/react/button'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { fanPosition } from '../lib/fan'
import { PlayingCard } from './PlayingCard'
import { useCardName } from './useCardName'

type MyHandProps = { cards: string[]; playable: string[]; onPlay: (card: string) => void; isLarge?: boolean }

/** Your cards held as a fan along the bottom edge. On your turn the cards you may play rise; the rest sink and grey. */
export function MyHand({ cards, playable, onPlay, isLarge = false }: MyHandProps) {
  const { t } = useTranslation('hartenjagen')
  const nameOf = useCardName()
  const isMyTurn = playable.length > 0
  return (
    <ul aria-label={t('table.yourHand')} className="flex justify-center px-4 pt-6 pb-2">
      {cards.map((card, index) => {
        const canPlay = playable.includes(card)
        const { tilt, drop } = fanPosition(index, cards.length)
        return (
          <li key={card} className={cn('-mx-[1.35rem] origin-bottom md:-mx-6', isLarge && '-mx-5', tilt, drop)}>
            <BaseButton
              disabled={!canPlay}
              onClick={() => onPlay(card)}
              aria-label={canPlay ? t('table.play', { card: nameOf(card) }) : nameOf(card)}
              className={cn(
                'block rounded-[var(--radius-card)] transition duration-200 ease-out',
                canPlay && '-translate-y-4 hover:-translate-y-6 focus-visible:-translate-y-6',
                isMyTurn && !canPlay && 'translate-y-2 brightness-[0.82] saturate-[0.4]',
              )}
            >
              <PlayingCard
                id={card}
                className={cn('w-[4.75rem] text-base md:w-28 md:text-xl', isLarge && 'w-[5.5rem] text-lg')}
              />
            </BaseButton>
          </li>
        )
      })}
    </ul>
  )
}
