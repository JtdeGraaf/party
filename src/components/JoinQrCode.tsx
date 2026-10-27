import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { joinLinkFor } from '@/api/rooms'
import { qrCodeFor } from '@/lib/qr-code'
import { cn } from '@/lib/utils'

/** The QR code a friend scans to land on this room's join screen. */
export function JoinQrCode({ code, className }: { code: string; className?: string }) {
  const { t } = useTranslation()
  const qr = useMemo(() => qrCodeFor(joinLinkFor(code)), [code])
  return (
    <svg
      viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`}
      role="img"
      aria-label={t('room.qrLabel')}
      className={cn('rounded-[var(--radius-cell)] shadow-sheet', className)}
    >
      <rect x="-2" y="-2" width={qr.size + 4} height={qr.size + 4} className="fill-ball" />
      <path d={qr.path} className="fill-print" />
    </svg>
  )
}
