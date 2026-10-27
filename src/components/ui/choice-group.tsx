import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { useId } from 'react'

type Choice<Value extends string | number> = { value: Value; label: string }

type ChoiceGroupProps<Value extends string | number> = {
  label: string
  choices: readonly Choice<Value>[]
  value: Value
  onChange: (value: Value) => void
}

/** A row of choices like cells on a bingo card; the picked one gets the dauber. */
export function ChoiceGroup<Value extends string | number>({
  label,
  choices,
  value,
  onChange,
}: ChoiceGroupProps<Value>) {
  const labelId = useId()
  return (
    <div className="grid gap-1.5">
      <span id={labelId} className="text-sm font-bold text-frame-text">
        {label}
      </span>
      <RadioGroup
        aria-labelledby={labelId}
        value={value}
        onValueChange={(picked) => onChange(picked as Value)}
        className="flex flex-wrap gap-2"
      >
        {choices.map((choice) => (
          <Radio.Root
            key={choice.value}
            value={choice.value}
            className="called relative grid h-14 min-w-16 place-items-center rounded-[var(--radius-cell)] bg-frame-cell px-3 text-3xl text-frame-text ring-2 ring-frame-text/60 ring-inset data-[checked]:ring-frame-text"
          >
            <Radio.Indicator className="absolute inset-1.5 animate-dab rounded-full bg-frame-mark/35 mix-blend-multiply" />
            <span className="relative">{choice.label}</span>
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  )
}
