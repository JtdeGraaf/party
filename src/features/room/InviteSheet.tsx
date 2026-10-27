import { useTranslation } from 'react-i18next'
import { Sheet } from '@/components/ui/sheet'
import { RoomCode } from './RoomCode'

type InviteSheetProps = { code: string; open: boolean; onOpenChange: (open: boolean) => void }

/** The code and QR, pulled up mid-game for someone who arrives late; they watch until the next game. */
export function InviteSheet({ code, open, onOpenChange }: InviteSheetProps) {
  const { t } = useTranslation()
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('room.inviteTitle')} closeLabel={t('common.close')}>
      <RoomCode code={code} size="big" />
    </Sheet>
  )
}
