import type { GameScreenProps } from '@/games/game-screens'
import { cn } from '@/lib/utils'
import { useQuilt, type QuiltOnScreen } from '../useQuilt'
import { FabricDefs } from './FabricDefs'
import { Quilt } from './Quilt'
import { ScoreStrip } from './ScoreStrip'
import { Swatch } from './Swatch'

/**
 * A phone at the quilt. On its own it shows the whole quilt; with a big screen in the room it shows the quilt only on
 * this phone's turn, and otherwise just says to look up.
 */
export function DotsPhone(props: GameScreenProps) {
  const quilt = useQuilt(props)
  if (!quilt) return null
  const showsQuilt = !props.hasTableScreen || quilt.summary.isMyTurn || quilt.summary.isFinished
  return (
    <div className="grid gap-4 font-quilt-body text-quilt-ink">
      <FabricDefs />
      <TurnLine quilt={quilt} />
      {showsQuilt ? <PhoneQuilt quilt={quilt} /> : <LookUp quilt={quilt} />}
      <ScoreStrip quilt={quilt} />
    </div>
  )
}

function TurnLine({ quilt }: { quilt: QuiltOnScreen }) {
  const { summary, headline } = quilt
  return (
    <p
      aria-live="polite"
      className={cn(
        'flex items-center justify-center gap-2 text-center font-quilt text-2xl font-bold',
        summary.isMyTurn && 'woven mx-auto w-fit rounded-[3px] px-4 py-1.5',
      )}
    >
      {summary.leaders.map((seat) => (
        <Swatch key={seat} seat={seat} />
      ))}
      <span>{headline}</span>
    </p>
  )
}

function PhoneQuilt({ quilt }: { quilt: QuiltOnScreen }) {
  const { view, summary } = quilt
  return (
    <>
      <Quilt
        size={view.size}
        drawnLines={view.drawnLines}
        boxOwners={view.boxOwners}
        lastLine={summary.isFinished ? null : view.lastLine}
        bindingSeat={summary.leaders[0] ?? null}
        isFinished={summary.isFinished}
        describePatch={quilt.describePatch}
        describeLine={quilt.describeLine}
        onSew={summary.isMyTurn ? quilt.sew : undefined}
        label={quilt.quiltLabel}
      />
      <p className="text-center text-sm text-quilt-ink-soft">{quilt.lastSeam}</p>
    </>
  )
}

function LookUp({ quilt }: { quilt: QuiltOnScreen }) {
  return (
    <p className="grid justify-items-center gap-3 py-10 text-center font-quilt text-2xl font-bold">
      <Swatch seat={quilt.view.turn ?? 0} className="size-14" />
      {quilt.lookUpText}
    </p>
  )
}
