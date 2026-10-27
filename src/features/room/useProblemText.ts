import { useTranslation } from 'react-i18next'
import { problemKey } from '@/lib/problem-text'
import type { Problem } from '@/party/problems'

type LooseTranslate = (key: string, options: object) => string
type LooseExists = (key: string, options: object) => boolean

/** A refusal in words. The key is built from a code off the wire, so one this version doesn't know gets a general text. */
export function useProblemText(problem: Problem | null): string | null {
  const { t, i18n } = useTranslation()
  if (!problem) return null
  const { namespace, key, values } = problemKey(problem)
  const exists = i18n.exists as LooseExists
  if (!exists(key, { ns: namespace })) return t('errors.unknown')
  return (i18n.t as LooseTranslate)(key, { ns: namespace, ...values })
}
