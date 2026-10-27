import { useTranslation } from 'react-i18next'
import type { GameScreenProps } from '@/games/game-screens'
import { useHearts, type HeartsOnScreen } from '../useHearts'
import { PlayingCard } from './PlayingCard'
import { Saucer } from './Saucer'
import { ScorePad } from './ScorePad'
import { TrickArea } from './TrickArea'

/** The big screen: every saucer round the table, the trick in the middle, and the notepad beside it. No hands. */
export function HeartsTable(props: GameScreenProps) {
  const { t } = useTranslation('hartenjagen')
  const hearts = useHearts(props)
  if (!hearts) return null
  const { view, names } = hearts
  return (
    <div className="grid gap-8 font-kitchen text-card-ink lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-start">
      <div className="grid content-start justify-items-center gap-8">
        <ul aria-label={t('table.others')} className="flex flex-wrap justify-center gap-6">
          {hearts.others.map((seat) => (
            <li key={seat}>
              <Saucer
                name={names[seat] ?? ''}
                isTurn={view.turn === seat}
                detail={t('table.points', { count: view.pointsThisHand[seat] ?? 0 })}
                className="md:w-36"
              />
            </li>
          ))}
        </ul>
        <Middle hearts={hearts} />
      </div>
      <div className="notepad rounded-md p-6 pl-14">
        <ScorePad hearts={hearts} isLarge />
      </div>
    </div>
  )
}

function Middle({ hearts }: { hearts: HeartsOnScreen }) {
  const { t } = useTranslation('hartenjagen')
  const { view, nameOf } = hearts
  if (view.phase === 'playing') {
    return (
      <>
        <TrickArea hearts={hearts} isLarge />
        <p aria-live="polite" className="text-lettered rounded-full bg-turn px-6 py-2 text-4xl text-band shadow-card">
          {t('table.theirTurn', { name: nameOf(view.turn ?? 0) })}
        </p>
      </>
    )
  }
  if (view.phase === 'over') {
    return (
      <h2 className="text-lettered text-center text-7xl text-band-ink drop-shadow-[0_3px_6px_rgb(59_36_24/0.65)]">
        {hearts.winnerHeadline}
      </h2>
    )
  }
  const lastHand = view.score.hands.at(-1)
  return (
    <section className="grid justify-items-center gap-5 py-6 text-center">
      {lastHand && (
        <p className="rounded-full bg-band px-6 py-2 text-2xl font-bold text-band-ink">
          {lastHand.allPointsBy === null
            ? t('table.handDone', { number: view.score.hands.length })
            : t('table.allPointsTaken', { name: nameOf(lastHand.allPointsBy) })}
        </p>
      )}
      {view.stock.cards && (
        <p className="flex items-center gap-3 text-xl font-bold text-band">
          {t('table.stockTurned')}
          {view.stock.cards.map((card) => (
            <PlayingCard key={card} id={card} className="w-20 text-base" />
          ))}
        </p>
      )}
      <p className="text-lettered text-4xl text-band">{t('table.waitingForDeal', { name: nameOf(view.dealer) })}</p>
    </section>
  )
}
