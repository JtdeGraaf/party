import { describe, expect, it } from 'vitest'
import type { RoomView } from '@/party/protocol'
import { namesBySeat } from './seats'

describe('namesBySeat', () => {
  it('orders the seated players by seat and leaves watchers out', () => {
    const room = {
      players: [
        { id: 'a', name: 'Anna', isConnected: true, seat: 1 },
        { id: 'b', name: 'Bram', isConnected: true, seat: null },
        { id: 'c', name: 'Cas', isConnected: false, seat: 0 },
      ],
    } as RoomView

    expect(namesBySeat(room)).toEqual(['Cas', 'Anna'])
  })
})
