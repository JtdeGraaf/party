import { useTranslation } from 'react-i18next'
import type { GameScreenProps } from '@/games/game-screens'
import { namesBySeat } from '@/lib/seats'
import { summariseQuilt, type QuiltHeadline } from './lib/quilt-summary'
import { dotsAndBoxesRules } from './rules/dotsandboxes-rules'
import type { Line } from './rules/board'

/** The quilt from the room's view: checked, with its words in the current language and a way to sew. */
export function useQuilt({ room, gameView, sendMove }: GameScreenProps) {
  const { t } = useTranslation('dotsandboxes')
  const parsed = dotsAndBoxesRules.viewSchema.safeParse(gameView)
  if (!parsed.success) return null
  const view = parsed.data
  const names = namesBySeat(room)
  const nameOf = (seat: number) => (seat === view.mySeat ? t('play.you') : (names[seat] ?? ''))
  const summary = summariseQuilt(view)

  function headlineText(headline: QuiltHeadline): string {
    switch (headline.says) {
      case 'yourTurn':
        return t('play.yourTurn')
      case 'theirTurn':
        return t('play.theirTurn', { name: names[headline.seat] })
      case 'youWin':
        return t('play.youWin', { count: headline.count })
      case 'win':
        return t('play.win', { name: names[headline.seat], count: headline.count })
      case 'draw':
        return t('play.draw', { names: headline.seats.map(nameOf).join(' & '), count: headline.count })
    }
  }

  const lastSewer = view.lastLine === null ? undefined : view.drawnLines[view.lastLine]

  return {
    view,
    names,
    nameOf,
    summary,
    headline: headlineText(summary.headline),
    lastSeam: lastSewer === undefined ? t('play.noSeams') : t('play.lastSeam', { name: nameOf(lastSewer) }),
    describePatch: (box: string) => {
      const owner = view.boxOwners[box]
      if (owner === undefined) return ''
      return t('play.patch', { name: nameOf(owner), stitch: view.boxStitch[box] })
    },
    describeLine: ({ direction, row, column }: Line) =>
      direction === 'h'
        ? t('play.seamAcross', { row: row + 1, from: column + 1, to: column + 2 })
        : t('play.seamDown', { column: column + 1, from: row + 1, to: row + 2 }),
    quiltLabel: t('play.quiltLabel', { size: view.size }),
    scoresLabel: t('play.scores'),
    lookUpText: t('play.lookUp', { name: names[view.turn ?? 0] }),
    sew: (line: string) => sendMove({ line }),
  }
}

export type QuiltOnScreen = NonNullable<ReturnType<typeof useQuilt>>
