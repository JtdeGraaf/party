/**
 * A hand held as a fan: each card tilted a little more than the one before, the outer ones dropping lower, like a
 * hand of cards seen from behind. Class names are written out in full so Tailwind finds them.
 */
const TILTS = [
  '-rotate-[16deg]',
  '-rotate-[12deg]',
  '-rotate-[8deg]',
  '-rotate-[4deg]',
  'rotate-0',
  'rotate-[4deg]',
  'rotate-[8deg]',
  'rotate-[12deg]',
  'rotate-[16deg]',
]
const DROPS = [
  'translate-y-5',
  'translate-y-3',
  'translate-y-1.5',
  'translate-y-0.5',
  'translate-y-0',
  'translate-y-0.5',
  'translate-y-1.5',
  'translate-y-3',
  'translate-y-5',
]

/** The tilt and drop for card `index` of `count`, centred on the middle of the fan. */
export function fanPosition(index: number, count: number): { tilt: string; drop: string } {
  const start = Math.floor((TILTS.length - Math.min(count, TILTS.length)) / 2)
  const slot = Math.min(start + index, TILTS.length - 1)
  return { tilt: TILTS[slot], drop: DROPS[slot] }
}

/** Where a finished trick slides to: down to your own hand, or up towards one of the others' saucers. */
export type GatherTowards = 'me' | 'far-left' | 'left' | 'right' | 'far-right'

const TOWARDS_SAUCER: readonly GatherTowards[][] = [
  [],
  ['right'],
  ['left', 'right'],
  ['far-left', 'right', 'far-right'],
  ['far-left', 'left', 'right', 'far-right'],
]

/** `othersIndex` is the winner's place among the other players' saucers, or null when you won the trick. */
export function gatherTowards(othersIndex: number | null, othersCount: number): GatherTowards {
  if (othersIndex === null) return 'me'
  return TOWARDS_SAUCER[othersCount]?.[othersIndex] ?? 'right'
}
