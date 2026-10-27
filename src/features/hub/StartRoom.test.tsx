import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { dotsAndBoxesScreens } from '@/games/dotsandboxes/dotsandboxes-screens'
import { readSavedName } from '@/lib/saved-seats'
import { renderInRouter } from '@/test/render-in-router'
import { JoinByCode } from './JoinByCode'
import { StartRoom } from './StartRoom'

const requests: unknown[] = []
const server = setupServer(
  http.post('*/api/rooms', async ({ request }) => {
    requests.push(await request.json())
    return HttpResponse.json({ code: 'KWPF' }, { status: 201 })
  }),
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  requests.length = 0
})
afterAll(() => server.close())

describe('opening a room', () => {
  it('asks for a name before opening a room on this phone', async () => {
    await renderInRouter(<StartRoom screens={dotsAndBoxesScreens} />)

    await userEvent.click(screen.getByRole('button', { name: 'Open a room' }))

    expect(await screen.findByText("Put your name in, so the others know who's who.")).toBeInTheDocument()
    expect(requests).toEqual([])
  })

  it('opens a room with the picked settings and takes the phone into it', async () => {
    const { router } = await renderInRouter(<StartRoom screens={dotsAndBoxesScreens} />)

    await userEvent.click(screen.getByRole('radio', { name: '5×5' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Your name' }), '  Anna ')
    await userEvent.click(screen.getByRole('button', { name: 'Open a room' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/room/KWPF'))
    expect(requests).toEqual([{ game: 'dotsandboxes', settings: { size: 5 } }])
    expect(readSavedName(localStorage)).toBe('Anna')
  })

  it('makes this screen the table without asking for a name', async () => {
    const { router } = await renderInRouter(<StartRoom screens={dotsAndBoxesScreens} />)

    await userEvent.click(screen.getByRole('button', { name: 'Use this screen as the table' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/table/KWPF'))
  })

  it('says the server is out of reach when it is', async () => {
    server.use(http.post('*/api/rooms', () => HttpResponse.error()))
    await renderInRouter(<StartRoom screens={dotsAndBoxesScreens} />)

    await userEvent.click(screen.getByRole('button', { name: 'Use this screen as the table' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't reach the room server.")
  })
})

describe('joining by code', () => {
  it('refuses something that is not a room code', async () => {
    const { router } = await renderInRouter(<JoinByCode />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Got a room code?' }), 'KOPF')
    await userEvent.click(screen.getByRole('button', { name: 'Join' }))

    expect(await screen.findByText('A room code is 4 letters, like KWPF.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('goes on to the name for a code typed in lower case with spaces', async () => {
    const { router } = await renderInRouter(<JoinByCode />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Got a room code?' }), 'kw pf')
    await userEvent.click(screen.getByRole('button', { name: 'Join' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/join/KWPF'))
  })
})
