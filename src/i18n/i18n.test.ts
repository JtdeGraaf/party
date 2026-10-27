import { describe, expect, it } from 'vitest'
import { DOTS_AND_BOXES_PROBLEMS } from '@/games/dotsandboxes/rules/dotsandboxes-rules'
import { HARTENJAGEN_PROBLEMS } from '@/games/hartenjagen/rules/hartenjagen-rules'
import { ROOM_PROBLEMS } from '@/party/problems'
import { resources } from './resources'

/** Every text in a translation file as [dotted key, text] pairs. */
function flatten(tree: object, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]): [string, string][] => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'object' && value !== null ? flatten(value, path) : [[path, String(value)]]
  })
}

const keysOf = (tree: object) =>
  flatten(tree)
    .map(([key]) => key)
    .sort()

const namespaces = Object.keys(resources.en) as (keyof typeof resources.en)[]

describe('translations', () => {
  it.each(namespaces)('have the same keys in English and Dutch in %s', (namespace) => {
    expect(keysOf(resources.nl[namespace])).toEqual(keysOf(resources.en[namespace]))
  })

  it('leave no text empty in any language', () => {
    const empty = Object.values(resources)
      .flatMap((language) => Object.values(language).flatMap((tree) => flatten(tree)))
      .filter(([, text]) => text.trim() === '')
      .map(([key]) => key)

    expect(empty).toEqual([])
  })

  it('have a text for exactly the room problem codes, plus the general one', () => {
    expect(Object.keys(resources.en.translation.errors).sort()).toEqual([...ROOM_PROBLEMS, 'unknown'].sort())
  })

  it('have a text for exactly each game’s own problem codes', () => {
    expect(Object.keys(resources.en.hartenjagen.errors).sort()).toEqual([...HARTENJAGEN_PROBLEMS].sort())
    expect(Object.keys(resources.en.dotsandboxes.errors).sort()).toEqual([...DOTS_AND_BOXES_PROBLEMS].sort())
  })
})
