import { describe, expect, it } from 'vitest'
import { allLines, boxesBeside, lineId, readLine } from './board'
import { playRound, winnersOf, type Move } from './round'

const ANNA = 0
const BEN = 1

/** Moves for the given lines, numbered in order and played by whichever seat is listed. */
function moves(...played: [number, string][]): Move[] {
  return played.map(([seat, line], number) => ({ number, line, seat }))
}

describe('the board', () => {
  it('has 24 lines on a 3 by 3 board', () => {
    expect(allLines(3)).toHaveLength(24)
  })

  it('reads line ids on the board and refuses ones off it', () => {
    expect(readLine('h-3-2', 3)).toEqual({ direction: 'h', row: 3, column: 2 })
    expect(readLine('h-4-0', 3)).toBeNull()
    expect(readLine('v-0-4', 3)).toBeNull()
    expect(readLine('x-0-0', 3)).toBeNull()
  })

  it('knows the boxes on either side of a line, and only one at the edge', () => {
    expect(boxesBeside({ direction: 'v', row: 1, column: 1 }, 3)).toEqual(['1-0', '1-1'])
    expect(boxesBeside({ direction: 'h', row: 0, column: 2 }, 3)).toEqual(['0-2'])
  })
})

describe('playRound', () => {
  it('starts with the first turn and passes it after a line that closes nothing', () => {
    const state = playRound({ size: 3, seats: 2, firstTurn: ANNA, moves: moves([ANNA, 'h-0-0']) })

    expect(state.drawnLines).toEqual({ 'h-0-0': ANNA })
    expect(state.turn).toBe(BEN)
  })

  it('can start with another seat', () => {
    expect(playRound({ size: 3, seats: 2, firstTurn: BEN, moves: [] }).turn).toBe(BEN)
  })

  it('gives the box and another turn to whoever draws its last side', () => {
    const state = playRound({
      size: 3,
      seats: 2,
      firstTurn: ANNA,
      moves: moves([ANNA, 'h-0-0'], [BEN, 'h-1-0'], [ANNA, 'v-0-0'], [BEN, 'v-0-1']),
    })

    expect(state.boxOwners).toEqual({ '0-0': BEN })
    expect(state.boxStitch).toEqual({ '0-0': 4 })
    expect(state.scores).toEqual([0, 1])
    expect(state.turn).toBe(BEN)
  })

  it('skips moves out of turn, lines drawn twice and lines off the board', () => {
    const state = playRound({
      size: 3,
      seats: 2,
      firstTurn: ANNA,
      moves: moves([BEN, 'h-0-0'], [ANNA, 'h-0-0'], [BEN, 'h-0-0'], [BEN, 'h-9-9'], [BEN, 'v-0-0']),
    })

    expect(state.drawnLines).toEqual({ 'h-0-0': ANNA, 'v-0-0': BEN })
    expect(state.turn).toBe(ANNA)
  })

  it('ends with no turn and the top scorer as winner when every box is taken', () => {
    let state = playRound({ size: 3, seats: 2, firstTurn: ANNA, moves: [] })
    const played: Move[] = []
    for (const line of allLines(3).map(lineId)) {
      played.push({ number: played.length, line, seat: state.turn ?? ANNA })
      state = playRound({ size: 3, seats: 2, firstTurn: ANNA, moves: played })
    }

    expect(Object.keys(state.boxOwners)).toHaveLength(9)
    expect(state.scores[ANNA] + state.scores[BEN]).toBe(9)
    expect(state.turn).toBeNull()
    expect(state.winners).toEqual([state.scores[ANNA] > state.scores[BEN] ? ANNA : BEN])
  })

  it('has no winners while boxes are left', () => {
    expect(playRound({ size: 3, seats: 2, firstTurn: ANNA, moves: moves([ANNA, 'h-0-0']) }).winners).toEqual([])
  })
})

describe('winnersOf', () => {
  it('names everyone with the top score on a draw', () => {
    expect(winnersOf([4, 4, 1])).toEqual([0, 1])
  })
})
