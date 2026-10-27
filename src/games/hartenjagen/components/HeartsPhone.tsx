import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import type { GameScreenProps } from '@/games/game-screens'
import { useHearts, type HeartsOnScreen } from '../useHearts'
import { MyHand } from './MyHand'
import { PlayingCard } from './PlayingCard'
import { Saucer } from './Saucer'
import { ScorePad } from './ScorePad'
import { TrickArea } from './TrickArea'

/**
 * A phone at the kitchen table. On its own it shows the others' saucers, the trick and your fanned hand; with a big
 * screen in the room it keeps only your hand, your turn and your points, since the table is up there.
 */
export function HeartsPhone(props: GameScreenProps) {
  const { t } = useTranslation('hartenjagen')
  const hub = useTranslation().t
  const hearts = useHearts(props)
  const [isScoreOpen, setIsScoreOpen] = useState(false)
  if (!hearts) return null
  if (hearts.view.phase === 'over') return <GameOver hearts={hearts} />

  return (
    <div className="grid gap-3 font-kitchen text-card-ink">
      {props.hasTableScreen ? (
        <p className="rounded-full bg-paper px-4 py-1 text-center font-semibold text-band">{t('table.lookUp')}</p>
      ) : (
        <TableFromMySeat hearts={hearts} />
      )}
      {hearts.view.phase === 'betweenHands' && <BetweenHands hearts={hearts} />}
      <TurnLine hearts={hearts} />
      {hearts.view.mine && (
        <MyHand
          cards={hearts.view.mine.cards}
          playable={hearts.view.mine.playable}
          onPlay={hearts.play}
          isLarge={props.hasTableScreen}
        />
      )}
      <Button width="fit" className="justify-self-center" onClick={() => setIsScoreOpen(true)}>
        {t('table.openScore')}
      </Button>
      <Sheet open={isScoreOpen} onOpenChange={setIsScoreOpen} title={t('score.title')} closeLabel={hub('common.close')}>
        <div className="notepad rounded-md p-5 pl-12">
          <ScorePad hearts={hearts} />
        </div>
      </Sheet>
    </div>
  )
}

function TableFromMySeat({ hearts }: { hearts: HeartsOnScreen }) {
  const { t } = useTranslation('hartenjagen')
  const { view, others, names } = hearts
  return (
    <>
      <ul aria-label={t('table.others')} className="flex justify-center gap-3 pt-2">
        {others.map((seat) => (
          <li key={seat}>
            <Saucer
              name={names[seat] ?? ''}
              isTurn={view.turn === seat}
              detail={t('table.points', { count: view.pointsThisHand[seat] ?? 0 })}
            />
          </li>
        ))}
      </ul>
      {view.phase === 'playing' && <TrickArea hearts={hearts} />}
    </>
  )
}

function TurnLine({ hearts }: { hearts: HeartsOnScreen }) {
  const { t } = useTranslation('hartenjagen')
  const { view, mySeat, isMyTurn, names } = hearts
  if (view.phase !== 'playing' || mySeat === null) return null
  return (
    <p aria-live="polite" className="flex items-center justify-center gap-3">
      <span
        className={
          isMyTurn
            ? 'text-lettered rounded-full bg-turn px-4 py-1 text-2xl text-band shadow-card'
            : 'rounded-full bg-band/90 px-4 py-1 font-bold text-band-ink'
        }
      >
        {isMyTurn ? t('table.yourTurn') : t('table.theirTurn', { name: names[view.turn ?? 0] })}
      </span>
      <span className="rounded-full bg-saucer px-3 py-1 text-sm font-bold text-band">
        {t('table.yourPoints', { count: view.pointsThisHand[mySeat] ?? 0 })}
      </span>
    </p>
  )
}

/** Between hands: what the last hand did, and the dealer's button for the next one. */
function BetweenHands({ hearts }: { hearts: HeartsOnScreen }) {
  const { t } = useTranslation('hartenjagen')
  const { view, nameOf, isMyDeal } = hearts
  const lastHand = view.score.hands.at(-1)
  return (
    <section className="grid justify-items-center gap-3 px-4 py-6">
      {lastHand && (
        <p className="rounded-full bg-band px-4 py-1 text-center font-bold text-band-ink">
          {lastHand.allPointsBy === null
            ? t('table.handDone', { number: view.score.hands.length })
            : t('table.allPointsTaken', { name: nameOf(lastHand.allPointsBy) })}
        </p>
      )}
      {view.stock.cards && <StockTurned cards={view.stock.cards} />}
      {isMyDeal ? (
        <Button look="plate" width="fit" onClick={hearts.deal}>
          {t('table.deal', { number: view.handNumber })}
        </Button>
      ) : (
        <p className="rounded-full bg-paper px-4 py-1 text-center font-semibold text-band">
          {t('table.waitingForDeal', { name: nameOf(view.dealer) })}
        </p>
      )}
    </section>
  )
}

function StockTurned({ cards }: { cards: string[] }) {
  const { t } = useTranslation('hartenjagen')
  return (
    <p className="flex items-center gap-2 rounded-full bg-band/90 py-1 pr-1 pl-3 text-sm font-bold text-band-ink">
      {t('table.stockTurned')}
      <StockCards cards={cards} />
    </p>
  )
}

function StockCards({ cards }: { cards: string[] }) {
  return (
    <span className="flex gap-1">
      {cards.map((card) => (
        <PlayingCard key={card} id={card} className="w-10 text-xs" />
      ))}
    </span>
  )
}

/** The game is won: who reached 0 first, and the full notepad. Playing again is the room's button below. */
function GameOver({ hearts }: { hearts: HeartsOnScreen }) {
  return (
    <div className="grid gap-5 pt-2 font-kitchen">
      <h2 className="text-lettered text-center text-5xl text-band-ink drop-shadow-[0_3px_6px_rgb(59_36_24/0.65)]">
        {hearts.winnerHeadline}
      </h2>
      <div className="notepad rounded-md p-5 pl-12">
        <ScorePad hearts={hearts} />
      </div>
    </div>
  )
}
