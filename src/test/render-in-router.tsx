import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

/** Renders a screen inside a real router, for components that navigate. `router` tells where they went. */
export async function renderInRouter(screen: ReactElement) {
  const rootRoute = createRootRoute({ component: () => screen, notFoundComponent: () => null })
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory({ initialEntries: ['/'] }) })
  await router.load()
  return { ...render(<RouterProvider router={router} />), router }
}
