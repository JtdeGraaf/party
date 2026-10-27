import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { readRoomCode } from '@/party/room-code'
import { roomCodeFormSchema, type RoomCodeForm } from './hub-forms'

/** Four letters read out across the table, and on to the name. */
export function JoinByCode() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const form = useForm<RoomCodeForm>({ resolver: zodResolver(roomCodeFormSchema), defaultValues: { code: '' } })
  const error = form.formState.errors.code?.message

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(({ code }) => {
        const roomCode = readRoomCode(code)
        if (roomCode) void navigate({ to: '/join/$code', params: { code: roomCode } })
      })}
      className="grid"
    >
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <TextField
          label={t('join.heading')}
          size="code"
          placeholder={t('join.codePlaceholder')}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={9}
          error={error ? t(error as 'join.codeInvalid') : undefined}
          {...form.register('code')}
        />
        <Button type="submit" look="plate" width="fit" className="mb-px h-[4.6rem]">
          {t('join.submit')}
        </Button>
      </div>
    </form>
  )
}
