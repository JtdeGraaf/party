import { useTranslation } from 'react-i18next'
import { Dab } from '@/components/Dab'
import { playersCard, type PlayerCell } from '@/lib/players-card'
import { cn } from '@/lib/utils'
import type { RoomView } from '@/party/protocol'

type PlayersCardProps = {
  room: RoomView
  players: { min: number; max: number }
  /** Bigger cells, for a screen read from across the room. */
  isLarge?: boolean
}

/** Who's in, as a bingo card: one cell per seat, a dab on everyone who has joined, the empty seats marked free. */
export function PlayersCard({ room, players, isLarge = false }: PlayersCardProps) {
  const { t } = useTranslation()
  const card = playersCard(room, players)
  return (
    <section aria-label={t('room.players')} className="grid gap-3">
      <ul
        className={cn(
          'grid gap-1.5 rounded-[var(--radius-cell)] bg-frame-panel p-1.5 shadow-sheet',
          isLarge
            ? 'grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]'
            : 'grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))]',
        )}
      >
        {card.cells.map((cell) => (
          <li key={cell.kind === 'player' ? cell.player.id : `free-${cell.index}`}>
            <Cell cell={cell} isLarge={isLarge} />
          </li>
        ))}
      </ul>
      {card.watchers.length > 0 && (
        <p className="w-fit text-sm ground-note">
          <span className="font-bold">{t('room.watching')}:</span>{' '}
          {card.watchers.map((watcher) => watcher.name).join(', ')}
        </p>
      )}
    </section>
  )
}

function Cell({ cell, isLarge }: { cell: PlayerCell; isLarge: boolean }) {
  const { t } = useTranslation()
  const size = isLarge ? 'h-36 text-5xl' : 'h-20 text-2xl'
  if (cell.kind === 'free') {
    return (
      <span
        className={cn(
          'called grid place-items-center rounded-[calc(var(--radius-cell)-2px)] bg-frame-cell text-frame-text-soft/60',
          size,
        )}
      >
        {t('room.free')}
      </span>
    )
  }
  const { player, isMe } = cell
  return (
    <span
      className={cn(
        'relative grid place-items-center overflow-hidden rounded-[calc(var(--radius-cell)-2px)] bg-frame-cell px-2 text-center text-frame-text',
        size,
      )}
    >
      {player.isConnected && <Dab key={player.id} className="absolute inset-1.5 m-auto aspect-square h-[88%]" />}
      <span className="relative grid">
        <span className="called truncate">{player.name}</span>
        {(isMe || !player.isConnected) && (
          <span className="text-xs font-bold text-frame-text-soft">{isMe ? t('room.you') : t('room.away')}</span>
        )}
      </span>
    </span>
  )
}
