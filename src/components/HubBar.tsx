import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CalledBalls } from './CalledBalls'
import { LanguageSwitch } from './ui/language-switch'

/** The hub's bar: the name as called balls, back to the shelf, and the language. */
export function HubBar() {
  const { t } = useTranslation()
  return (
    <header className="flex items-center justify-between gap-3 bg-frame px-3 py-2 text-frame-ink">
      <Link to="/" className="rounded-full p-0.5 hover:bg-frame-ink/10" aria-label={t('common.home')}>
        <CalledBalls letters={t('meta.appName').toUpperCase()} label={t('meta.appName')} size="bar" />
      </Link>
      <LanguageSwitch />
    </header>
  )
}
