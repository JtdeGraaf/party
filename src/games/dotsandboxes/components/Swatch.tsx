import { cn } from '@/lib/utils'

/** A little square of a seat's print, the way a player is shown next to their name. */
export function Swatch({ seat, className }: { seat: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      className={cn('size-5 flex-none rounded-[2px]', className)}
    >
      <rect width="40" height="40" fill={`url(#fabric-${seat % 4})`} />
      <rect className="quilt-swatch-stitch" x="4" y="4" width="32" height="32" />
    </svg>
  )
}
