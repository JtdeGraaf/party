import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { HubBar } from '@/components/HubBar'

export const Route = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFound,
})

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="sheet-paper min-h-dvh">
      <HubBar />
      <main className="grid place-content-center gap-4 py-24 text-center">
        <p className="called text-6xl">{t('notFound.title')}</p>
        <Link to="/" className="font-bold underline underline-offset-4">
          {t('notFound.home')}
        </Link>
      </main>
    </div>
  )
}
