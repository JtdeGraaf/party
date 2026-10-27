import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { GameScreens } from '@/games/game-screens'
import { readSavedName } from '@/lib/saved-seats'
import { nameFormSchema, type NameForm } from './hub-forms'
import { NameField } from './NameField'
import { useStartRoom } from './useStartRoom'

/** Opening a room for one game: its settings, then play on phones, or make this screen the table. */
export function StartRoom({ screens }: { screens: GameScreens }) {
  const { t } = useTranslation()
  const start = useStartRoom(screens)
  const form = useForm<NameForm, unknown, { name: string }>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: { name: readSavedName(localStorage) ?? '' },
  })
  const { Settings } = screens

  return (
    <div className="grid gap-6">
      {Settings && (
        <section className="grid gap-3 rounded-[var(--radius-cell)] bg-frame-panel p-4 text-frame-text shadow-sheet">
          <h2 className="called text-3xl">{t('start.settings')}</h2>
          <Settings settings={start.settings} onChange={start.setSettings} />
        </section>
      )}

      <form
        noValidate
        onSubmit={form.handleSubmit(({ name }) => start.openOnPhone(name))}
        className="grid gap-3 rounded-[var(--radius-cell)] bg-frame-panel p-4 text-frame-text shadow-sheet"
      >
        <h2 className="called text-4xl">{t('start.phonesHeading')}</h2>
        <p className="text-frame-text-soft">{t('start.phonesHint')}</p>
        <NameField form={form} />
        <Button type="submit" look="plate" disabled={start.isOpening}>
          {start.isOpening ? t('start.opening') : t('start.openOnPhone')}
        </Button>
      </form>

      <section className="grid gap-2">
        <h2 className="called text-3xl">{t('start.tableHeading')}</h2>
        <p>{t('start.tableHint')}</p>
        <Button disabled={start.isOpening} onClick={() => void start.openOnTable()}>
          {t('start.openOnTable')}
        </Button>
      </section>

      {start.problem && (
        <p role="alert" className="font-bold text-wrong">
          {t(`start.${start.problem}`)}
        </p>
      )}
    </div>
  )
}
