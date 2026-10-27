import { useTranslation } from 'react-i18next'
import { CalledBalls } from '@/components/CalledBalls'
import { siteName } from '@/api/rooms'
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
        'flex items-center gap-x-6 gap-y-4',
        isHuge ? 'flex-nowrap justify-between gap-x-10' : 'flex-wrap justify-center',
        className,
      )}
    >
      <div className={cn('grid gap-2', isHuge ? 'justify-items-start' : 'justify-items-center')}>
        {isHuge && <p className="ground-note called text-5xl">{t('room.joinAt', { site: siteName() })}</p>}
        <CalledBalls letters={code} label={t('room.codeLabel', { code })} size={size} isRolling />
        <p className={cn('font-semibold ground-note', isHuge ? 'text-2xl' : 'text-center text-sm')}>
          {t('room.readOut')}
        </p>
      </div>
      <JoinQrCode code={code} className={isHuge ? 'w-[min(32vh,18rem)] flex-none' : 'w-32'} />
    </section>
  )
}
