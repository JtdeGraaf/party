import { useTranslation } from 'react-i18next'

export function HeartsRules() {
  const { t } = useTranslation('hartenjagen')
  return (
    <div className="grid gap-2 font-kitchen">
      <ul className="grid list-disc gap-2 pl-5">
        <li>{t('rules.deck')}</li>
        <li>{t('rules.points')}</li>
        <li>{t('rules.scoring')}</li>
        <li>{t('rules.allPoints')}</li>
      </ul>
      <p className="text-sm text-frame-text-soft">{t('rules.seats')}</p>
    </div>
  )
}

/** Two cards fanned on a saucer, the queen of spades on top, for the shelf. */
export function HeartsEmblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <circle cx="50" cy="54" r="44" className="fill-saucer" />
      <circle cx="50" cy="54" r="30" className="fill-saucer-rim" />
      <g transform="rotate(-14 50 50)">
        <rect x="26" y="20" width="36" height="52" rx="4" className="fill-card stroke-card-edge" strokeWidth="1.5" />
        <path
          d="M44 58c-7-5-11-9-11-13 0-3 2-5 5-5 2 0 4 1 6 3 2-2 4-3 6-3 3 0 5 2 5 5 0 4-4 8-11 13Z"
          className="fill-card-red"
        />
      </g>
      <g transform="rotate(12 50 50)">
        <rect x="40" y="22" width="36" height="52" rx="4" className="fill-card stroke-card-edge" strokeWidth="1.5" />
        <svg x="45" y="34" width="26" height="26" viewBox="0 0 100 100">
          <path
            d="M50 4C30 30 6 42 6 60c0 14 11 22 23 22 8 0 14-4 17-9-2 11-6 18-13 23h34c-7-5-11-12-13-23 3 5 9 9 17 9 12 0 23-8 23-22C94 42 70 30 50 4Z"
            className="fill-card-ink"
          />
        </svg>
      </g>
    </svg>
  )
}
