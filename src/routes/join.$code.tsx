import { createFileRoute, notFound } from '@tanstack/react-router'
import { HubBar } from '@/components/HubBar'
import { JoinWithName } from '@/features/hub/JoinWithName'
import { readRoomCode } from '@/party/room-code'

export const Route = createFileRoute('/join/$code')({
  beforeLoad: ({ params }) => {
    const code = readRoomCode(params.code)
    if (!code) throw notFound()
    return { code }
  },
  component: JoinWithNamePage,
})

function JoinWithNamePage() {
  const { code } = Route.useRouteContext()
  return (
    <div className="sheet-paper min-h-dvh">
      <HubBar />
      <main className="mx-auto max-w-md px-4 pt-10 pb-16">
        <JoinWithName code={code} />
      </main>
    </div>
  )
}
