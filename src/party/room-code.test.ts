import { describe, expect, it } from 'vitest'
import { seededRandom } from './random'
import { newRoomCode, readRoomCode, ROOM_CODE_LETTERS } from './room-code'

describe('room codes', () => {
  it('are four letters from the readable set', () => {
    const codes = Array.from({ length: 50 }, (_, seed) => newRoomCode(seededRandom(seed)))

    expect(codes.every((code) => /^[A-Z]{4}$/.test(code))).toBe(true)
    expect(codes.join('').split('').every((letter) => ROOM_CODE_LETTERS.includes(letter))).toBe(true)
  })

  it('read the way people type them', () => {
    expect(readRoomCode(' kw-pf ')).toBe('KWPF')
    expect(readRoomCode('k w p f')).toBe('KWPF')
  })

  it('refuse the wrong length or letters that are never used', () => {
    expect(readRoomCode('KWP')).toBeNull()
    expect(readRoomCode('KWPFF')).toBeNull()
    expect(readRoomCode('KOPF')).toBeNull()
    expect(readRoomCode('KW1F')).toBeNull()
  })
})
