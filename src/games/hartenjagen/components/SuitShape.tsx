import type { Suit } from '../rules/cards'
import { cn } from '@/lib/utils'

const SHAPES: Record<Suit, string> = {
  hearts: 'M50 90C20 66 5 46 5 29 5 14 17 5 30 5c10 0 17 6 20 14 3-8 10-14 20-14 13 0 25 9 25 24 0 17-15 37-45 61Z',
  diamonds: 'M50 4 86 50 50 96 14 50Z',
  spades:
    'M50 4C30 30 6 42 6 60c0 14 11 22 23 22 8 0 14-4 17-9-2 11-6 18-13 23h34c-7-5-11-12-13-23 3 5 9 9 17 9 12 0 23-8 23-22C94 42 70 30 50 4Z',
  clubs:
    'M50 6a20 20 0 0 1 17 30 20 20 0 1 1-13 35c1 11 5 19 13 25H33c8-6 12-14 13-25a20 20 0 1 1-13-35A20 20 0 0 1 50 6Z',
}

/** A drawn suit pip, coloured by the card's ink. */
export function SuitShape({ suit, className }: { suit: Suit; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={cn('fill-current', className)}>
      <path d={SHAPES[suit]} />
    </svg>
  )
}
