import { beforeEach, describe, expect, it } from 'vitest'
import { forgetSeat, readSavedName, readSavedSeat, saveName, saveSeat } from './saved-seats'

const token = 'a'.repeat(32)

describe('saved seats', () => {
  beforeEach(() => localStorage.clear())

  it('remembers the seat for each room separately', () => {
    saveSeat(localStorage, 'KWPF', { playerId: 'p1', seatToken: token })

    expect(readSavedSeat(localStorage, 'KWPF')).toEqual({ playerId: 'p1', seatToken: token })
    expect(readSavedSeat(localStorage, 'BBBB')).toBeNull()
  })

  it('ignores a saved seat that is not one', () => {
    localStorage.setItem('party:seat:KWPF', '{"playerId":"p1","seatToken":"short"}')
    localStorage.setItem('party:seat:BBBB', 'not json')

    expect(readSavedSeat(localStorage, 'KWPF')).toBeNull()
    expect(readSavedSeat(localStorage, 'BBBB')).toBeNull()
  })

  it('forgets a seat', () => {
    saveSeat(localStorage, 'KWPF', { playerId: 'p1', seatToken: token })

    forgetSeat(localStorage, 'KWPF')

    expect(readSavedSeat(localStorage, 'KWPF')).toBeNull()
  })

  it('reads the saved name tidied, and nothing when it is only spaces', () => {
    saveName(localStorage, '  Anna   de  Vries ')
    expect(readSavedName(localStorage)).toBe('Anna de Vries')

    saveName(localStorage, '   ')
    expect(readSavedName(localStorage)).toBeNull()
  })
})
