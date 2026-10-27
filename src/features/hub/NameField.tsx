import type { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField } from '@/components/ui/text-field'
import type { NameForm } from './hub-forms'

/** The one name field, shared by opening a room and joining one. */
export function NameField({ form }: { form: UseFormReturn<NameForm, unknown, { name: string }> }) {
  const { t } = useTranslation()
  const error = form.formState.errors.name?.message
  return (
    <TextField
      label={t('join.nameLabel')}
      autoComplete="given-name"
      enterKeyHint="go"
      error={error ? t(error as 'join.nameRequired') : undefined}
      {...form.register('name')}
    />
  )
}
