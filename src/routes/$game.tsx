import { createFileRoute, notFound } from '@tanstack/react-router'
import { HubBar } from '@/components/HubBar'
import { StartRoom } from '@/features/hub/StartRoom'
import { useGameName } from '@/features/room/useGameName'
import { screensFor } from '@/games/screens-registry'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/$game')({
  loader: ({ params }) => {
    const screens = screensFor(params.game)
    if (!screens) throw notFound()
    return screens
  },
  component: GamePage,
})

function GamePage() {
  const screens = Route.useLoaderData()
  const name = useGameName(screens.id)
  const { Rules, Backdrop } = screens
  return (
    <div className={cn(screens.worldClass, 'relative isolate min-h-dvh bg-frame-ground text-frame-on-ground')}>
      {Backdrop && <Backdrop />}
      <HubBar />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 pt-6 pb-16 md:grid-cols-2 md:gap-12 md:pt-12">
        <div className="grid content-start gap-4">
          <h1 className="called text-7xl">{name}</h1>
          <div className="rounded-[var(--radius-cell)] bg-frame-panel p-4 text-frame-text shadow-sheet">
            <Rules />
          </div>
        </div>
        <StartRoom screens={screens} />
      </main>
    </div>
  )
}
