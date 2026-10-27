import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { HartenjagenView } from '../rules/hartenjagen-rules'
import type { HeartsOnScreen } from '../useHearts'
import { CardBack, PlayingCard } from './PlayingCard'

type TrickAreaProps = {
  hearts: HeartsOnScreen
  /** Bigger cards, for a table screen across the room. */
  isLarge?: boolean
}

/**
 * The middle of the table. Each player's card lies in front of their place: the others' in a row, yours closest to
 * you. A finished trick lies still for a moment, then slides off to whoever took it.
 */
export function TrickArea({ hearts, isLarge = false }: TrickAreaProps) {
  const { t } = useTranslation('hartenjagen')
  const { view, others, mySeat, nameOf } = hearts
  const trick = view.trick
  const cardOf = (seat: number) => trick?.cards.find((played) => played.seat === seat)?.card
  const takenBy = trick?.takenBy ?? null
  const gather = takenBy === null ? null : takenBy === mySeat ? 'animate-gather-me' : 'animate-gather-up'

  return (
    <section
      aria-label={t('table.middle')}
      aria-live="polite"
      className="grid content-center justify-items-center gap-2"
    >
      <div key={view.handNumber} className={cn('grid justify-items-center gap-1', gather)}>
        <ol className={cn('flex justify-center', isLarge ? 'gap-4' : 'gap-1.5')}>
          {others.map((seat) => (
            <li key={seat}>
              <Slot card={cardOf(seat)} from="top" isLarge={isLarge} />
            </li>
          ))}
        </ol>
        {mySeat !== null && <Slot card={cardOf(mySeat)} from="bottom" isLarge={isLarge} />}
      </div>
      <div className="flex min-h-8 flex-wrap items-center justify-center gap-2">
        {takenBy !== null && (
          <p className={cn('rounded-full bg-band px-3 py-1 font-bold text-band-ink', isLarge ? 'text-2xl' : 'text-sm')}>
            {t('table.tookTrick', { name: nameOf(takenBy) })}
          </p>
        )}
        <Stock view={view} nameOf={nameOf} isLarge={isLarge} />
      </div>
    </section>
  )
}

function Stock({
  view,
  nameOf,
  isLarge,
}: {
  view: HartenjagenView
  nameOf: (seat: number) => string
  isLarge: boolean
}) {
  const { t } = useTranslation('hartenjagen')
  if (view.stock.count === 0) return null
  const label =
    view.stock.takenBy === null ? t('table.stock') : t('table.stockTaken', { name: nameOf(view.stock.takenBy) })
  return (
    <span className="flex items-center gap-2">
      <span className="flex pl-2">
        {Array.from({ length: view.stock.count }, (_, index) => (
          <CardBack key={index} className={cn('-ml-2', isLarge ? 'w-14' : 'w-9')} />
        ))}
      </span>
      <span
        className={cn('rounded-full bg-band/85 px-2 py-0.5 font-bold text-band-ink', isLarge ? 'text-lg' : 'text-xs')}
      >
        {label}
      </span>
    </span>
  )
}

/** One place on the table: the card played there, or the faint outline of where it will land. */
function Slot({ card, from, isLarge }: { card: string | undefined; from: 'top' | 'bottom'; isLarge: boolean }) {
  const size = isLarge ? 'w-[7.5rem] text-2xl' : 'w-[4.1rem] text-sm md:w-24 md:text-lg'
  if (!card) {
    return (
      <span
        aria-hidden="true"
        className={cn('block aspect-[5/7] rounded-[var(--radius-card)] border-2 border-dashed border-band/25', size)}
      />
    )
  }
  return (
    <PlayingCard
      id={card}
      className={cn(size, from === 'top' ? 'animate-land-from-top' : 'animate-land-from-bottom')}
    />
  )
}
