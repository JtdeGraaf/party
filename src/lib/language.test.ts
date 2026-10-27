import { describe, expect, it } from 'vitest'
import { parseLanguage, pickStartingLanguage } from './language'

describe('pickStartingLanguage', () => {
  it('keeps the language picked before', () => {
    expect(pickStartingLanguage({ saved: 'en', browserLanguages: ['nl-NL'] })).toBe('en')
  })

  it('starts in Dutch for a Dutch browser and in English otherwise', () => {
    expect(pickStartingLanguage({ saved: null, browserLanguages: ['de-DE', 'nl-BE'] })).toBe('nl')
    expect(pickStartingLanguage({ saved: null, browserLanguages: ['fr-FR'] })).toBe('en')
  })

  it('reads only the languages it knows', () => {
    expect([parseLanguage('nl'), parseLanguage('de'), parseLanguage(null)]).toEqual(['nl', null, null])
  })
})
