import { useTranslation } from 'react-i18next'
import { CalledBalls } from '@/components/CalledBalls'
import { JoinQrCode } from '@/components/JoinQrCode'
import { cn } from '@/lib/utils'

type RoomCodeProps = { code: string; size: 'big' | 'huge'; className?: string }

/** The four called balls and the QR code next to them: everything a friend needs to get in. */
export function RoomCode({ code, size, className }: RoomCodeProps) {
  const { t } = useTranslation()
  const isHuge = size === 'huge'
  return (
    <section
      aria-label={t('room.codeLabel', { code })}
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-4',
        isHuge ? 'justify-start' : 'justify-center',
        className,
      )}
    >
      <div className={cn('grid gap-2', isHuge ? 'justify-items-start' : 'justify-items-center')}>
        <CalledBalls letters={code} label={t('room.codeLabel', { code })} size={size} isRolling />
        <p
          className={cn(
            'font-semibold rounded-[var(--radius-cell)] bg-frame-panel/90 px-3 py-1 text-frame-text',
            isHuge ? 'text-2xl' : 'text-center text-sm',
          )}
        >
          {t('room.readOut')}
        </p>
      </div>
      <JoinQrCode code={code} className={isHuge ? 'w-[min(26vh,15rem)]' : 'w-32'} />
    </section>
  )
}
