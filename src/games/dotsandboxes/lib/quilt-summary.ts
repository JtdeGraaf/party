import type { DotsAndBoxesView } from '../rules/dotsandboxes-rules'

export type QuiltHeadline =
  | { says: 'yourTurn' }
  | { says: 'theirTurn'; seat: number }
  | { says: 'youWin'; count: number }
  | { says: 'win'; seat: number; count: number }
  | { says: 'draw'; seats: number[]; count: number }

export type QuiltSummary = {
  isFinished: boolean
  isMyTurn: boolean
  /** Whose thread leads: the seat whose turn it is, or the winners once the quilt is whole. */
  leaders: number[]
  headline: QuiltHeadline
}

/** What the quilt's caption says, from this phone's side of the table. */
export function summariseQuilt(view: DotsAndBoxesView): QuiltSummary {
  const isFinished = view.turn === null
  const isMyTurn = !isFinished && view.turn === view.mySeat
  return {
    isFinished,
    isMyTurn,
    leaders: isFinished ? view.winners : [view.turn ?? 0],
    headline: headlineOf(view, isFinished),
  }
}

function headlineOf(view: DotsAndBoxesView, isFinished: boolean): QuiltHeadline {
  if (!isFinished) {
    const seat = view.turn ?? 0
    return seat === view.mySeat ? { says: 'yourTurn' } : { says: 'theirTurn', seat }
  }
  const [first, ...others] = view.winners
  const count = view.scores[first] ?? 0
  if (others.length > 0) return { says: 'draw', seats: view.winners, count }
  if (first === view.mySeat) return { says: 'youWin', count }
  return { says: 'win', seat: first, count }
}
