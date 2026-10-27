import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { DotsAndBoxesView } from '@/games/dotsandboxes/rules/dotsandboxes-rules'
import { saveName } from '@/lib/saved-seats'
import type { RoomCode } from '@/party/room-code'
import { startFakeRoomServer } from '@/test/fake-room-server'
import { renderInRouter } from '@/test/render-in-router'
import { RoomGuest } from '@/test/room-guest'
import { RoomScreen } from './RoomScreen'

let fake: ReturnType<typeof startFakeRoomServer>

beforeEach(() => {
  fake = startFakeRoomServer()
})

afterEach(() => fake.stop())

async function openRoom(code: string, game: string, settings?: unknown): Promise<RoomCode> {
  expect(await fake.host.open(code, game, settings)).toBe('opened')
  return code as RoomCode
}

describe('a phone in a room', () => {
  it('sits down, sees the others join, starts and sews a seam the others see', async () => {
    const code = await openRoom('KWPF', 'dotsandboxes', { size: 3 })
    saveName(localStorage, 'Anna')
    await renderInRouter(<RoomScreen code={code} role="player" />)
    await screen.findByRole('region', { name: 'In the room' })
    const bram = await RoomGuest.player(fake.host, code, 'Bram')

    const start = await screen.findByRole('button', { name: 'Start' })
    await waitFor(() => expect(start).toBeEnabled())
    await userEvent.click(start)
    await userEvent.click(await screen.findByRole('button', { name: 'Sew across, row 1, from pin 1 to pin 2' }))

    await waitFor(() =>
      expect((bram.view?.gameView as DotsAndBoxesView | undefined)?.drawnLines).toEqual({ 'h-0-0': 0 }),
    )
    expect(await screen.findByText('Bram is sewing')).toBeInTheDocument()
  })

  it('holds only its own cards, and keeps them when it comes back', async () => {
    const code = await openRoom('BCDF', 'hartenjagen')
    saveName(localStorage, 'Anna')
    const first = await renderInRouter(<RoomScreen code={code} role="player" />)
    await screen.findByRole('region', { name: 'In the room' })
    const others = [await RoomGuest.player(fake.host, code, 'Bram')]
    others.push(await RoomGuest.player(fake.host, code, 'Cas'), await RoomGuest.player(fake.host, code, 'Dirk'))
    await others[0].send({ type: 'start' })

    const hand = await screen.findByRole('list', { name: 'Your cards' })
    const cards = within(hand)
      .getAllByRole('img')
      .map((card) => card.getAttribute('aria-label'))
    expect(cards).toHaveLength(8)

    first.unmount()
    await renderInRouter(<RoomScreen code={code} role="player" />)

    const handAgain = await screen.findByRole('list', { name: 'Your cards' })
    expect(
      within(handAgain)
        .getAllByRole('img')
        .map((card) => card.getAttribute('aria-label')),
    ).toEqual(cards)
    expect(fake.host.storedRoom(code)?.players).toHaveLength(4)
  })

  it('shows only the private part while a table screen is in the room', async () => {
    const code = await openRoom('GHJK', 'hartenjagen')
    saveName(localStorage, 'Anna')
    await renderInRouter(<RoomScreen code={code} role="player" />)
    await screen.findByRole('region', { name: 'In the room' })
    for (const name of ['Bram', 'Cas', 'Dirk']) await RoomGuest.player(fake.host, code, name)
    const table = await RoomGuest.table(fake.host, code)

    await table.send({ type: 'start' })

    expect(await screen.findByText('Your cards. The table is on the big screen.')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'The other players' })).not.toBeInTheDocument()
  })

  it('says so when the room does not exist', async () => {
    saveName(localStorage, 'Anna')

    await renderInRouter(<RoomScreen code={'ZZZZ' as RoomCode} role="player" />)

    expect(await screen.findByRole('heading', { name: "There's no room ZZZZ." })).toBeInTheDocument()
  })
})
