import { Button as BaseButton } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-bold transition duration-150 ease-out disabled:cursor-default disabled:opacity-45 data-[disabled]:cursor-default data-[disabled]:opacity-45',
  {
    variants: {
      look: {
        /** The one thing to do now: a solid plate printed in reverse. One per screen. */
        plate:
          'called rounded-[var(--radius-cell)] bg-frame-plate px-6 pt-3 pb-2.5 text-3xl text-frame-plate-ink shadow-sheet enabled:hover:-translate-y-px enabled:active:translate-y-0',
        /** Everything else: printed outline on the sheet. */
        quiet:
          'rounded-[var(--radius-cell)] px-4 py-2.5 text-base text-frame-on-ground ring-2 ring-frame-on-ground/70 ring-inset enabled:hover:bg-frame-on-ground/10 enabled:hover:ring-frame-on-ground',
        /** Small, inside the frame's bar. */
        bar: 'rounded-full px-3 py-1.5 text-sm whitespace-nowrap text-frame-ink ring-1 ring-frame-ink/50 ring-inset enabled:hover:bg-frame-ink/12',
      },
      width: { full: 'w-full', fit: 'w-fit' },
    },
    defaultVariants: { look: 'quiet', width: 'full' },
  },
)

type ButtonProps = Omit<ComponentProps<typeof BaseButton>, 'className'> &
  VariantProps<typeof buttonVariants> & { className?: string }

export function Button({ look, width, className, ...props }: ButtonProps) {
  return <BaseButton className={cn(buttonVariants({ look, width }), className)} {...props} />
}
