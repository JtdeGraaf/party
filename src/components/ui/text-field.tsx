import { Field } from '@base-ui/react/field'
import { Input } from '@base-ui/react/input'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full rounded-[var(--radius-cell)] border-2 border-frame-text/70 bg-frame-cell px-3 text-frame-text placeholder:text-frame-text-soft/45 focus-visible:border-frame-mark focus-visible:outline-none data-[invalid]:border-wrong',
  {
    variants: {
      size: {
        normal: 'py-2.5 text-lg',
        /** For a room code: four tall letters, spaced like called balls. */
        code: 'called py-1.5 text-center text-5xl tracking-[0.35em] uppercase placeholder:tracking-[0.35em]',
      },
    },
    defaultVariants: { size: 'normal' },
  },
)

const labelVariants = cva('text-frame-text', {
  variants: {
    size: {
      normal: 'text-sm font-bold',
      code: 'called text-4xl',
    },
  },
  defaultVariants: { size: 'normal' },
})

type TextFieldProps = Omit<ComponentProps<typeof Input>, 'className' | 'size'> &
  VariantProps<typeof inputVariants> & {
    label: string
    error?: string
    className?: string
  }

/** A labelled text input printed on the sheet, with its error underneath. */
export function TextField({ label, error, size, className, ...props }: TextFieldProps) {
  return (
    <Field.Root invalid={error !== undefined} className={cn('grid gap-1.5', className)}>
      <Field.Label className={labelVariants({ size })}>{label}</Field.Label>
      <Input className={inputVariants({ size })} {...props} />
      {error && (
        <Field.Error match className="text-sm font-semibold text-wrong">
          {error}
        </Field.Error>
      )}
    </Field.Root>
  )
}
