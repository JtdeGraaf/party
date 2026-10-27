import { cn } from '@/lib/utils'

type SaucerProps = { name: string; detail?: string; isTurn?: boolean; isMe?: boolean; className?: string }

/** A player's place at the table: a coffee saucer with its well in the middle and their name in it. */
export function Saucer({ name, detail, isTurn = false, isMe = false, className }: SaucerProps) {
  return (
    <div
      className={cn(
        'grid aspect-square w-[4.25rem] place-content-center rounded-full bg-saucer shadow-card ring-[5px] ring-saucer-rim transition duration-300 md:w-28',
        isTurn && 'shadow-lifted ring-turn',
        className,
      )}
    >
      <div className="grid size-[3.1rem] place-content-center rounded-full text-center shadow-[inset_0_2px_4px_rgb(58_30_12/0.18)] md:size-20">
        <span
          className={cn(
            'max-w-[3rem] truncate text-sm font-extrabold text-band md:max-w-[4.5rem] md:text-base',
            isMe && 'underline decoration-2 underline-offset-2',
          )}
        >
          {name}
        </span>
        {detail && <span className="text-xs font-semibold text-pencil md:text-sm">{detail}</span>}
      </div>
    </div>
  )
}
