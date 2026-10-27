import { describe, expect, it } from 'vitest'
import type { DotsAndBoxesView } from '../rules/dotsandboxes-rules'
import { summariseQuilt } from './quilt-summary'

function view(overrides: Partial<DotsAndBoxesView>): DotsAndBoxesView {
  return {
    size: 3,
    seats: 3,
    drawnLines: {},
    boxOwners: {},
    boxStitch: {},
    scores: [0, 0, 0],
    turn: 0,
    winners: [],
    lastLine: null,
    mySeat: 1,
    ...overrides,
  }
}

describe('summariseQuilt', () => {
  it('says whose turn it is from this phone', () => {
    expect(summariseQuilt(view({ turn: 1 }))).toMatchObject({ isMyTurn: true, headline: { says: 'yourTurn' } })
    expect(summariseQuilt(view({ turn: 2 }))).toMatchObject({
      isMyTurn: false,
      leaders: [2],
      headline: { says: 'theirTurn', seat: 2 },
    })
  })

  it('names the winner, this phone, or a draw once the quilt is whole', () => {
    expect(summariseQuilt(view({ turn: null, winners: [1], scores: [2, 5, 2] })).headline).toEqual({
      says: 'youWin',
      count: 5,
    })
    expect(summariseQuilt(view({ turn: null, winners: [0], scores: [5, 2, 2] })).headline).toEqual({
      says: 'win',
      seat: 0,
      count: 5,
    })
    expect(summariseQuilt(view({ turn: null, winners: [0, 2], scores: [4, 1, 4] }))).toMatchObject({
      leaders: [0, 2],
      headline: { says: 'draw', seats: [0, 2], count: 4 },
    })
  })
})
