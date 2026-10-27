import { createFileRoute, notFound } from '@tanstack/react-router'
import { RoomScreen } from '@/features/room/RoomScreen'
import { readRoomCode } from '@/party/room-code'

export const Route = createFileRoute('/table/$code')({
  beforeLoad: ({ params }) => {
    const code = readRoomCode(params.code)
    if (!code) throw notFound()
    return { code }
  },
  component: TablePage,
})

function TablePage() {
  const { code } = Route.useRouteContext()
  return <RoomScreen code={code} role="table" />
}
