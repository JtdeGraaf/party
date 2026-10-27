import { createFileRoute } from '@tanstack/react-router'
import { HubBar } from '@/components/HubBar'
import { JoinByCode } from '@/features/hub/JoinByCode'

export const Route = createFileRoute('/join/')({ component: JoinPage })

function JoinPage() {
  return (
    <div className="sheet-paper min-h-dvh">
      <HubBar />
      <main className="mx-auto max-w-md px-4 pt-10 pb-16">
        <JoinByCode />
      </main>
    </div>
  )
}
