import { describe, expect, it } from 'vitest'
import { fanPosition, gatherTowards } from './fan'

describe('fanPosition', () => {
  it('tilts the outer cards most and keeps the fan centred', () => {
    expect(fanPosition(0, 9).tilt).toBe('-rotate-[16deg]')
    expect(fanPosition(8, 9).tilt).toBe('rotate-[16deg]')
    expect(fanPosition(2, 5).tilt).toBe('rotate-0')
  })

  it('drops the outer cards lower than the middle ones', () => {
    expect(fanPosition(0, 6).drop).toBe('translate-y-3')
    expect(fanPosition(3, 6).drop).toBe('translate-y-0')
  })
})

describe('gatherTowards', () => {
  it('sends your own trick down to you', () => {
    expect(gatherTowards(null, 3)).toBe('me')
  })

  it('sends a trick towards the winner’s saucer, from left to right', () => {
    expect([0, 1, 2].map((index) => gatherTowards(index, 3))).toEqual(['far-left', 'right', 'far-right'])
    expect([0, 1, 2, 3].map((index) => gatherTowards(index, 4))).toEqual(['far-left', 'left', 'right', 'far-right'])
  })
})
