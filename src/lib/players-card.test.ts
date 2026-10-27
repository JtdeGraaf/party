import { describe, expect, it } from 'vitest'
import type { RoomView } from '@/party/protocol'
import { playersCard } from './players-card'

function room(overrides: Partial<RoomView>): RoomView {
  return {
    version: 1,
    code: 'KWPF',
    game: 'dotsandboxes',
    settings: {},
    phase: 'lobby',
    players: [],
    me: null,
    tableScreens: 0,
    canStart: false,
    isOver: false,
    gameView: null,
    ...overrides,
  }
}

const player = (id: string, seat: number | null = null) => ({ id, name: id, isConnected: true, seat })

describe('playersCard', () => {
  it('fills the seats in join order and leaves the rest free', () => {
    const card = playersCard(room({ players: [player('a'), player('b')], me: { playerId: 'b', seat: null } }), {
      min: 2,
      max: 4,
    })

    expect(
      card.cells.map((cell) => (cell.kind === 'player' ? `${cell.player.id}${cell.isMe ? '*' : ''}` : 'free')),
    ).toEqual(['a', 'b*', 'free', 'free'])
    expect(card.missing).toBe(0)
  })

  it('counts how many more are needed', () => {
    expect(playersCard(room({ players: [player('a')] }), { min: 4, max: 5 }).missing).toBe(3)
  })

  it('lets those past the last seat watch', () => {
    const card = playersCard(room({ players: ['a', 'b', 'c'].map((id) => player(id)) }), { min: 2, max: 2 })

    expect(card.watchers.map((watcher) => watcher.id)).toEqual(['c'])
  })

  it('shows the seats the server gave once a game runs, in seat order', () => {
    const playing = room({ phase: 'playing', players: [player('a', 1), player('b', null), player('c', 0)] })

    const card = playersCard(playing, { min: 2, max: 2 })

    expect(card.cells.map((cell) => (cell.kind === 'player' ? cell.player.id : 'free'))).toEqual(['c', 'a'])
    expect(card.watchers.map((watcher) => watcher.id)).toEqual(['b'])
  })
})
