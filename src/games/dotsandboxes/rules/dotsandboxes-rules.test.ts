import { describe, expect, it } from 'vitest'
import { seededRandom } from '../../../party/random'
import { describeGameRules } from '../../../test/game-contract'
import { allLines, lineId } from './board'
import { dotsAndBoxesRules } from './dotsandboxes-rules'

describeGameRules(dotsAndBoxesRules, {
  settings: { size: 3 },
  pickMove(state, random) {
    const view = dotsAndBoxesRules.view(state, { as: 'table' })
    const free = allLines(state.size)
      .map(lineId)
      .filter((line) => !(line in view.drawnLines))
    return { seat: view.turn ?? 0, move: { line: free[random.below(free.length)] } }
  },
})

const start = (gameNumber = 1) =>
  dotsAndBoxesRules.start({ seats: 3, settings: { size: 3 }, gameNumber, random: seededRandom(1), now: 0 }).state

const context = (seat: number, line: string) => ({ seat, move: { line }, random: seededRandom(1), now: 0 })

describe('dots and boxes moves', () => {
  it('lets the next seat start each new game in the room', () => {
    expect([1, 2, 3, 4].map((gameNumber) => dotsAndBoxesRules.view(start(gameNumber), { as: 'table' }).turn)).toEqual([
      0, 1, 2, 0,
    ])
  })

  it('refuses a line out of turn, off the board, or already drawn', () => {
    const state = start()
    const afterOne = dotsAndBoxesRules.move(state, context(0, 'h-0-0'))
    if ('problem' in afterOne) throw new Error(afterOne.problem)

    expect(dotsAndBoxesRules.move(state, context(1, 'h-0-0'))).toEqual({ problem: 'notYourTurn' })
    expect(dotsAndBoxesRules.move(state, context(0, 'h-9-9'))).toEqual({ problem: 'notALine' })
    expect(dotsAndBoxesRules.move(afterOne.state, context(1, 'h-0-0'))).toEqual({ problem: 'lineTaken' })
  })

  it('tells a seat which one it is, and the table none', () => {
    const state = start()

    expect(dotsAndBoxesRules.view(state, { as: 'seat', seat: 2 }).mySeat).toBe(2)
    expect(dotsAndBoxesRules.view(state, { as: 'table' }).mySeat).toBeNull()
  })
})
