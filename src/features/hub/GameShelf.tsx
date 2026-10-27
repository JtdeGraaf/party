import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Dab } from '@/components/Dab'
import type { GameScreens } from '@/games/game-screens'
import { GAME_SCREENS } from '@/games/screens-registry'
import { cn } from '@/lib/utils'
import { useDabThenGo } from './useDabThenGo'

/** Every game as a sheet on the shelf, each printed in its own world's colours. */
export function GameShelf() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="shelf-heading" className="grid gap-4">
      <h1 id="shelf-heading" className="called text-6xl sm:text-7xl">
        {t('shelf.heading')}
      </h1>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-3">
        {GAME_SCREENS.map((screens) => (
          <li key={screens.id}>
            <ShelfSheet screens={screens} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ShelfSheet({ screens }: { screens: GameScreens }) {
  const { t } = useTranslation()
  const game = useTranslation(screens.id).t
  const { Emblem } = screens
  const navigate = useNavigate()
  const pick = useDabThenGo(() => void navigate({ to: '/$game', params: { game: screens.id } }))
  return (
    <Link
      to="/$game"
      params={{ game: screens.id }}
      onClick={pick.onClick}
      className={cn(
        screens.worldClass,
        'group relative grid h-full grid-cols-[1fr_auto] gap-3 overflow-hidden rounded-[var(--radius-cell)] bg-frame-ground p-4 text-frame-on-ground shadow-sheet transition duration-200 ease-out hover:-translate-y-0.5',
      )}
    >
      <span className="grid content-between gap-6">
        <span className="grid gap-1">
          <span className="called text-5xl">{game('meta.name')}</span>
          <span className="text-sm font-semibold">{game('meta.tagline')}</span>
        </span>
        <span className="w-fit rounded-full bg-frame px-3 py-1 text-xs font-bold text-frame-ink">
          {t('shelf.players', screens.players)}
        </span>
      </span>
      {pick.isDabbed && <Dab className="absolute -top-6 -right-6 size-40 fill-dab" />}
      <Emblem className="w-16 self-center transition duration-300 ease-out group-hover:rotate-3" />
    </Link>
  )
}
