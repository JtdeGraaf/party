import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CalledBalls } from '@/components/CalledBalls'
import { LanguageSwitch } from '@/components/ui/language-switch'
import { cn } from '@/lib/utils'

type RoomBarProps = {
  code: string
  gameName: string
  isConnected: boolean
  onInvite: () => void
  children?: ReactNode
}

/** The frame's bar along the top of a room: the code (tap it to invite), the game, the connection, the language. */
export function RoomBar({ code, gameName, isConnected, onInvite, children }: RoomBarProps) {
  const { t } = useTranslation()
  return (
    <header className="flex items-center gap-2 bg-frame px-3 py-2 text-frame-ink">
      <button
        type="button"
        onClick={onInvite}
        aria-label={t('room.invite')}
        className="rounded-full p-0.5 hover:bg-frame-ink/10"
      >
        <CalledBalls letters={code} label={t('room.codeLabel', { code })} size="bar" />
      </button>
      <span className="called min-w-0 truncate text-2xl">{gameName}</span>
      <span role="status" className="mr-auto flex flex-none items-center gap-1.5 text-xs font-bold">
        <span
          aria-hidden="true"
          className={cn('size-2.5 rounded-full', isConnected ? 'bg-frame-mark' : 'animate-pulse bg-frame-ink-soft')}
        />
        {isConnected ? <span className="sr-only">{t('room.connected')}</span> : t('room.reconnecting')}
      </span>
      {children}
      <LanguageSwitch />
    </header>
  )
}
