import type { GameScreenProps } from '@/games/game-screens'
import { useQuilt } from '../useQuilt'
import { FabricDefs } from './FabricDefs'
import { Quilt } from './Quilt'
import { ScoreStrip } from './ScoreStrip'
import { Swatch } from './Swatch'

/** The big screen: the quilt as large as the room allows, whose turn it is, and everyone's patches beside it. */
export function DotsTable(props: GameScreenProps) {
  const quilt = useQuilt(props)
  if (!quilt) return null
  const { view, summary } = quilt
  return (
    <div className="grid items-center gap-8 font-quilt-body text-quilt-ink lg:grid-cols-[minmax(0,1fr)_24rem]">
      <FabricDefs />
      <div className="mx-auto w-full max-w-[min(100%,78vh)]">
        <Quilt
          size={view.size}
          drawnLines={view.drawnLines}
          boxOwners={view.boxOwners}
          lastLine={summary.isFinished ? null : view.lastLine}
          bindingSeat={summary.leaders[0] ?? null}
          isFinished={summary.isFinished}
          describeLine={quilt.describeLine}
          label={quilt.quiltLabel}
        />
      </div>
      <div className="grid content-center gap-6">
        <p aria-live="polite" className="flex items-center gap-3 font-quilt text-5xl leading-tight font-extrabold">
          {summary.leaders.map((seat) => (
            <Swatch key={seat} seat={seat} className="size-12" />
          ))}
          <span>{quilt.headline}</span>
        </p>
        <p className="text-xl text-quilt-ink-soft">{quilt.lastSeam}</p>
        <ScoreStrip quilt={quilt} isLarge />
      </div>
    </div>
  )
}
