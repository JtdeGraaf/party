import { useTranslation } from 'react-i18next'
import { isRedSuit, readCard, type Rank, type Suit } from '../rules/cards'
import { cn } from '@/lib/utils'
import { SuitShape } from './SuitShape'
import { useCardName } from './useCardName'

const FACE_RANKS: readonly Rank[] = ['J', 'Q', 'K']

/** One playing card face up: corner indices and a big pip, or the court letter, in the middle. */
export function PlayingCard({ id, className }: { id: string; className?: string }) {
  const { t } = useTranslation('hartenjagen')
  const nameOf = useCardName()
  const card = readCard(id)
  if (!card) return null
  const rank = t(`cards.short.${card.rank}`)
  const ink = isRedSuit(card.suit) ? 'text-card-red' : 'text-card-ink'

  return (
    <span
      role="img"
      aria-label={nameOf(id)}
      className={cn(
        'relative inline-block aspect-[5/7] w-16 rounded-[var(--radius-card)] border border-card-edge bg-card shadow-card select-none',
        ink,
        className,
      )}
    >
      <Corner rank={rank} suit={card.suit} />
      <Corner rank={rank} suit={card.suit} upsideDown />
      <span className="absolute inset-0 grid place-items-center">
        {FACE_RANKS.includes(card.rank) ? (
          <span className="text-lettered text-[2.4em] leading-none">{rank}</span>
        ) : (
          <SuitShape suit={card.suit} className="w-[42%]" />
        )}
      </span>
    </span>
  )
}

function Corner({ rank, suit, upsideDown = false }: { rank: string; suit: Suit; upsideDown?: boolean }) {
  return (
    <span
      className={cn(
        'absolute grid w-[1.4em] justify-items-center text-[0.95em] leading-none font-extrabold',
        upsideDown ? 'right-[0.2em] bottom-[0.25em] rotate-180' : 'top-[0.25em] left-[0.2em]',
      )}
    >
      {rank}
      <SuitShape suit={suit} className="mt-[0.1em] w-[0.8em]" />
    </span>
  )
}

/** A card face down: the back of a deck, for the stok and other players' hands. */
export function CardBack({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block aspect-[5/7] w-16 rounded-[var(--radius-card)] border-[3px] border-card bg-petal-brown bg-[repeating-linear-gradient(45deg,var(--color-oilcloth-deep)_0_3px,transparent_3px_9px),repeating-linear-gradient(-45deg,var(--color-oilcloth-deep)_0_3px,transparent_3px_9px)] shadow-card',
        className,
      )}
    />
  )
}
