export const LANGUAGES = ['en', 'nl'] as const

export type Language = (typeof LANGUAGES)[number]

export function parseLanguage(value: unknown): Language | null {
  return LANGUAGES.includes(value as Language) ? (value as Language) : null
}

/** The language a visit starts in: the one picked before, else Dutch for a Dutch browser, else English. */
export function pickStartingLanguage({
  saved,
  browserLanguages,
}: {
  saved: Language | null
  browserLanguages: readonly string[]
}): Language {
  if (saved) return saved
  return browserLanguages.some((language) => language.toLowerCase().startsWith('nl')) ? 'nl' : 'en'
}
