import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

/** While the first view is on its way. */
export function Arriving() {
  const { t } = useTranslation()
  return (
    <p role="status" className="called py-24 text-center text-4xl text-frame-on-ground">
      {t('room.arriving')}
    </p>
  )
}

/** The code leads nowhere: it was mistyped, or the room closed after a quiet while. */
export function RoomGone({ code }: { code: string }) {
  const { t } = useTranslation()
  return (
    <main className="mx-auto grid max-w-md gap-4 px-4 py-24 text-center">
      <h1 className="called text-5xl">{t('room.gone', { code })}</h1>
      <p>{t('room.goneHint')}</p>
      <Link to="/" className="font-bold underline underline-offset-4">
        {t('common.home')}
      </Link>
    </main>
  )
}
