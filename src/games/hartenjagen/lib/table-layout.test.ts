import { describe, expect, it } from 'vitest'
import { formatChange, seatsAfter } from './table-layout'

describe('seatsAfter', () => {
  it('lists the others clockwise from the seat after yours', () => {
    expect(seatsAfter(5, 2)).toEqual([3, 4, 0, 1])
    expect(seatsAfter(4, 0)).toEqual([1, 2, 3])
  })

  it('lists every seat for someone who is not seated', () => {
    expect(seatsAfter(4, null)).toEqual([0, 1, 2, 3])
  })
})

describe('formatChange', () => {
  it('signs a change, with a real minus sign', () => {
    expect([formatChange(3), formatChange(-3), formatChange(0)]).toEqual(['+3', '−3', '0'])
  })
})
