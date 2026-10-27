import { allBoxes, boxesBeside, readLine, sidesOf, type BoardSize } from './board'

/** One line drawn by one seat. Moves are numbered from 0 within a round. */
export type Move = { number: number; line: string; seat: number }

export type Round = { size: BoardSize; seats: number; firstTurn: number; moves: readonly Move[] }

export type RoundState = {
  /** Line id → the seat that drew it. */
  drawnLines: Record<string, number>
  /** Box id → the seat that closed it. */
  boxOwners: Record<string, number>
  /** Box id → which stitch closed it, counting from 1. */
  boxStitch: Record<string, number>
  /** Boxes per seat. */
  scores: number[]
  /** The seat whose turn it is, or null once every box is taken. */
  turn: number | null
  winners: number[]
  lastLine: string | null
}

/** Replays a round's moves in order. A move out of turn, or a line drawn twice or off the board, is skipped. */
export function playRound({ size, seats, firstTurn, moves }: Round): RoundState {
  const drawnLines: Record<string, number> = {}
  const boxOwners: Record<string, number> = {}
  const boxStitch: Record<string, number> = {}
  const scores = Array.from({ length: seats }, () => 0)
  const boxCount = size * size
  let turn = firstTurn % seats
  let lastLine: string | null = null

  for (const move of [...moves].sort((first, second) => first.number - second.number)) {
    if (Object.keys(boxOwners).length === boxCount) break
    if (move.seat !== turn) continue
    const line = readLine(move.line, size)
    if (!line || drawnLines[move.line] !== undefined) continue

    drawnLines[move.line] = move.seat
    lastLine = move.line
    const closedBoxes = boxesBeside(line, size).filter((box) => sidesOf(box).every((side) => side in drawnLines))
    for (const box of closedBoxes) {
      boxOwners[box] = move.seat
      boxStitch[box] = Object.keys(drawnLines).length
    }
    scores[move.seat] += closedBoxes.length
    // Closing a box earns another turn.
    if (closedBoxes.length === 0) turn = (turn + 1) % seats
  }

  const isFinished = Object.keys(boxOwners).length === boxCount
  return {
    drawnLines,
    boxOwners,
    boxStitch,
    scores,
    turn: isFinished ? null : turn,
    winners: isFinished ? winnersOf(scores) : [],
    lastLine,
  }
}

export function boxesLeft(state: RoundState, size: BoardSize): number {
  return allBoxes(size).length - Object.keys(state.boxOwners).length
}

/** Every seat with the top score; more than one on a draw. */
export function winnersOf(scores: readonly number[]): number[] {
  const best = Math.max(...scores)
  return scores.flatMap((score, seat) => (score === best ? [seat] : []))
}
