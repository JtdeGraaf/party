import { cn } from '@/lib/utils'

/** A dauber's ink ring is never a clean circle: the sponge leaves a soft, slightly lumpy edge. */
const INK = 'M50 3c13 0 21 5 29 12s16 17 17 30-1 24-9 33-17 16-31 18-26-1-35-8S4 72 3 58 4 30 12 20 37 3 50 3Z'

/** A dauber mark in translucent ink, stamped on whatever it sits behind. It lands once, when it first appears. */
export function Dab({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={cn('pointer-events-none animate-dab fill-frame-mark opacity-80 mix-blend-multiply', className)}
    >
      <path d={INK} />
    </svg>
  )
}
