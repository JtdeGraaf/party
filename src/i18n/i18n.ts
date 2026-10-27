import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { parseLanguage, pickStartingLanguage, type Language } from '@/lib/language'
import { resources } from './resources'

const LANGUAGE_KEY = 'party:language'

export function startingLanguage(): Language {
  return pickStartingLanguage({ saved: readSavedLanguage(), browserLanguages: navigator.languages })
}

export function setUpTranslations(language: Language) {
  i18next.on('languageChanged', showLanguage)
  return i18next.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
  })
}

/** Switches the whole app and remembers the choice for the next visit. */
export function switchLanguage(language: Language): void {
  void i18next.changeLanguage(language)
  try {
    localStorage.setItem(LANGUAGE_KEY, language)
  } catch {
    // A private window may refuse storage; the switch still works for this visit.
  }
}

function showLanguage(language: string): void {
  document.documentElement.lang = language
  document.title = i18next.t('meta.title')
}

function readSavedLanguage(): Language | null {
  try {
    return parseLanguage(localStorage.getItem(LANGUAGE_KEY))
  } catch {
    return null
  }
}
