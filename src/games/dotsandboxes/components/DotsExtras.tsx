import { useTranslation } from 'react-i18next'
import { ChoiceGroup } from '@/components/ui/choice-group'
import type { GameSettingsProps } from '@/games/game-screens'
import { BOARD_SIZES } from '../rules/board'
import { dotsAndBoxesRules } from '../rules/dotsandboxes-rules'

/** How big the quilt is: 3, 4 or 5 patches a side. */
export function DotsSettings({ settings, onChange }: GameSettingsProps) {
  const { t } = useTranslation('dotsandboxes')
  const parsed = dotsAndBoxesRules.settingsSchema.safeParse(settings)
  const current = parsed.success ? parsed.data : dotsAndBoxesRules.defaultSettings
  return (
    <ChoiceGroup
      label={t('settings.size')}
      choices={BOARD_SIZES.map((size) => ({ value: size, label: t('settings.sizeChoice', { size }) }))}
      value={current.size}
      onChange={(size) => onChange({ ...current, size })}
    />
  )
}

export function DotsRules() {
  const { t } = useTranslation('dotsandboxes')
  return (
    <div className="grid gap-2">
      <ol className="grid list-decimal gap-2 pl-5">
        <li>{t('rules.one')}</li>
        <li>{t('rules.two')}</li>
        <li>{t('rules.three')}</li>
      </ol>
      <p className="text-sm text-frame-text-soft">{t('rules.seats')}</p>
    </div>
  )
}

/** A four-patch block with pins at the corners, for the shelf. */
export function DotsEmblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <rect x="4" y="4" width="92" height="92" rx="6" className="fill-backing-deep" />
      <rect x="12" y="12" width="36" height="36" rx="2" className="fill-fabric-0" />
      <rect x="52" y="12" width="36" height="36" rx="2" className="fill-fabric-1" />
      <rect x="12" y="52" width="36" height="36" rx="2" className="fill-fabric-2" />
      <rect x="52" y="52" width="36" height="36" rx="2" className="fill-fabric-3" />
      {[10, 50, 90].flatMap((x) =>
        [10, 50, 90].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" className="fill-pin" />),
      )}
    </svg>
  )
}
