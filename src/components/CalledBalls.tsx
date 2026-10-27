import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/** Each ball's band takes the next bingo column colour: B, I, N, G, O, and round again. */
const BANDS = ['bg-ball-b', 'bg-ball-i', 'bg-ball-n', 'bg-ball-g', 'bg-ball-o'] as const

/** Written out in full so Tailwind finds them. */
const ROLL_DELAYS = [
  '[animation-delay:0ms]',
  '[animation-delay:90ms]',
  '[animation-delay:180ms]',
  '[animation-delay:270ms]',
  '[animation-delay:360ms]',
] as const

const ballVariants = cva('grid aspect-square place-items-center rounded-full shadow-ball', {
  variants: {
    size: {
      bar: 'w-7 p-[3px] text-lg',
      small: 'w-11 p-1 text-3xl',
      big: 'w-[4.5rem] p-1.5 text-5xl sm:w-24 sm:text-7xl',
      huge: 'w-[min(22vh,10vw,14rem)] p-[0.7rem] text-[min(17vh,7.6vw,11rem)]',
    },
  },
  defaultVariants: { size: 'big' },
})

type CalledBallsProps = VariantProps<typeof ballVariants> & {
  letters: string
  /** Read out as one word, since screen readers would spell balls out one by one anyway. */
  label: string
  /** Rolls the balls in one after the other, the first time they show. */
  isRolling?: boolean
  className?: string
}

/** Letters shown as called bingo balls: a coloured band, a white face, the letter big in the middle. */
export function CalledBalls({ letters, label, size, isRolling = false, className }: CalledBallsProps) {
  return (
    <span role="img" aria-label={label} className={cn('inline-flex gap-1.5 sm:gap-2', className)}>
      {[...letters].map((letter, index) => (
        <span
          key={`${index}-${letter}`}
          aria-hidden="true"
          className={cn(
            ballVariants({ size }),
            BANDS[index % BANDS.length],
            isRolling && ['animate-ball-roll', ROLL_DELAYS[index % ROLL_DELAYS.length]],
          )}
        >
          <span className="called grid size-full place-items-center rounded-full bg-ball pt-[0.08em] text-print">
            {letter}
          </span>
        </span>
      ))}
    </span>
  )
}
