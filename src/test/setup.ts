import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { setUpTranslations } from '@/i18n/i18n'

await setUpTranslations('en')

// jsdom has no scrolling; the router scrolls to the top on every navigation.
window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
