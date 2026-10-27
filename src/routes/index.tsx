import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { HubBar } from '@/components/HubBar'
import { GameShelf } from '@/features/hub/GameShelf'
import { JoinByCode } from '@/features/hub/JoinByCode'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { t } = useTranslation()
  return (
    <div className="sheet-paper min-h-dvh">
      <HubBar />
      <main className="mx-auto grid max-w-5xl gap-10 px-4 pt-6 pb-16 lg:grid-cols-[1fr_22rem] lg:gap-12 lg:pt-12">
        <div className="grid content-start gap-4">
          <GameShelf />
          <p className="max-w-prose text-print-soft">{t('shelf.pitch')}</p>
        </div>
        <aside className="order-first lg:order-none lg:pt-24">
          <JoinByCode />
        </aside>
      </main>
    </div>
  )
}
