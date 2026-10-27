import { cn } from '@/lib/utils'
import type { QuiltOnScreen } from '../useQuilt'
import { Swatch } from './Swatch'

/** Woven name labels in seat order, each with its print and its patches; the one whose turn it is stands out. */
export function ScoreStrip({ quilt, isLarge = false }: { quilt: QuiltOnScreen; isLarge?: boolean }) {
  const { view, nameOf, summary, scoresLabel } = quilt
  return (
    <ol aria-label={scoresLabel} className={cn('flex flex-wrap justify-center gap-2', isLarge && 'gap-4')}>
      {view.scores.map((score, seat) => (
        <li
          key={seat}
          className={cn(
            'woven flex items-center gap-2 rounded-[2px] font-quilt font-bold shadow-[0_2px_4px_rgb(8_12_28/0.35)]',
            isLarge ? 'px-4 py-2 text-3xl' : 'px-2.5 py-1 text-base',
            summary.leaders.includes(seat) && 'outline-2 outline-offset-3 outline-label-cloth outline-dashed',
          )}
        >
          <Swatch seat={seat} className={isLarge ? 'size-9' : undefined} />
          <span className="max-w-[9rem] truncate">{nameOf(seat)}</span>
          <span className="numbers">{score}</span>
        </li>
      ))}
    </ol>
  )
}
