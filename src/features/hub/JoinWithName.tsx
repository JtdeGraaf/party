import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CalledBalls } from '@/components/CalledBalls'
import { Button } from '@/components/ui/button'
import { readSavedName, saveName } from '@/lib/saved-seats'
import type { RoomCode } from '@/party/room-code'
import { nameFormSchema, type NameForm } from './hub-forms'
import { NameField } from './NameField'

/** Arriving from a scanned code or a typed one: only the name is left to give. */
export function JoinWithName({ code }: { code: RoomCode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const form = useForm<NameForm, unknown, { name: string }>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: { name: readSavedName(localStorage) ?? '' },
  })

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(({ name }) => {
        saveName(localStorage, name)
        void navigate({ to: '/room/$code', params: { code } })
      })}
      className="grid gap-5"
    >
      <h1 className="grid justify-items-center gap-3 text-center">
        <span className="called text-4xl">{t('join.nameHeading')}</span>
        <CalledBalls letters={code} label={t('room.codeLabel', { code })} size="big" isRolling />
      </h1>
      <div className="grid gap-3 rounded-[var(--radius-cell)] bg-frame-panel p-4 text-frame-text shadow-sheet">
        <NameField form={form} />
        <Button type="submit" look="plate">
          {t('join.sitDown')}
        </Button>
      </div>
    </form>
  )
}
