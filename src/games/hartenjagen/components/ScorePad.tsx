import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { formatChange } from '../lib/table-layout'
import { COUNT_UP_TO } from '../rules/scoring'
import type { HeartsOnScreen } from '../useHearts'

/** The notepad: one row per hand with what it did to each score, and the running totals underneath. */
export function ScorePad({ hearts, isLarge = false }: { hearts: HeartsOnScreen; isLarge?: boolean }) {
  const { t } = useTranslation('hartenjagen')
  const { score, playerCount } = hearts.view
  const seats = Array.from({ length: playerCount }, (_, seat) => seat)

  function directionText() {
    if (score.winners.length > 0) return t('score.final')
    if (score.nextDirection === 'up') return t('score.countingUp', { target: COUNT_UP_TO })
    return t('score.countingDown')
  }

  return (
    <div className={cn('grid gap-3', isLarge && 'text-xl')}>
      <p className={cn('pencilled', isLarge ? 'text-3xl' : 'text-xl')}>{directionText()}</p>
      <table className="w-full table-fixed border-collapse text-center">
        <thead>
          <tr>
            <th className="w-10 pb-1 text-left text-xs font-bold text-pencil-soft">{t('score.hand')}</th>
            {seats.map((seat) => (
              <th
                key={seat}
                className={cn(
                  'truncate pb-1 font-extrabold text-band',
                  isLarge ? 'text-xl' : 'text-sm',
                  seat === hearts.mySeat && 'underline',
                )}
              >
                {hearts.names[seat]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {score.hands.map((hand, index) => (
            <tr key={index} className={cn('align-top', isLarge ? 'h-16' : 'h-14')}>
              <td className="pencilled text-left">{index + 1}</td>
              {hand.change.map((change, seat) => (
                <td key={seat} className={cn('pencilled leading-tight', isLarge ? 'text-2xl' : 'text-lg')}>
                  {formatChange(change)}
                  <span className="block text-sm text-pencil-soft">{hand.totals[seat]}</span>
                  {hand.allPointsBy === seat && (
                    <span className="block text-xs text-card-red">{t('score.allPoints')}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          {score.hands.length === 0 && (
            <tr className="h-7">
              <td colSpan={seats.length + 1} className="pencilled text-left">
                {t('score.empty')}
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-pencil">
            <td className="pt-1 text-left text-xs font-bold text-pencil-soft">{t('score.total')}</td>
            {score.totals.map((total, seat) => (
              <td key={seat} className={cn('pencilled pt-1', isLarge ? 'text-4xl' : 'text-2xl')}>
                {total}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
      <p className="text-sm text-pencil-soft">{t('score.rules')}</p>
    </div>
  )
}
