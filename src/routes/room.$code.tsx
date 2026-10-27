import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { RoomScreen } from '@/features/room/RoomScreen'
import { readSavedName, readSavedSeat } from '@/lib/saved-seats'
import { readRoomCode } from '@/party/room-code'

export const Route = createFileRoute('/room/$code')({
  beforeLoad: ({ params }) => {
    const code = readRoomCode(params.code)
    if (!code) throw notFound()
    // A phone needs a name to sit down; one that already sits here gets back in with its seat.
    if (!readSavedName(localStorage) && !readSavedSeat(localStorage, code)) {
      throw redirect({ to: '/join/$code', params: { code } })
    }
    return { code }
  },
  component: RoomPage,
})

function RoomPage() {
  const { code } = Route.useRouteContext()
  return <RoomScreen code={code} role="player" />
}
