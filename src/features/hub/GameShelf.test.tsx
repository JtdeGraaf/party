import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderInRouter } from '@/test/render-in-router'
import { GameShelf } from './GameShelf'

describe('the game shelf', () => {
  it('lists every game and opens the one picked', async () => {
    const { router } = await renderInRouter(<GameShelf />)

    expect(screen.getAllByRole('link')).toHaveLength(2)
    await userEvent.click(screen.getByRole('link', { name: /Dots and boxes/ }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/dotsandboxes'))
  })
})
