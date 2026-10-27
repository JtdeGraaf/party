import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { playersCard } from '@/lib/players-card'
import type { RoomView } from '@/party/protocol'
import type { GameScreens } from '@/games/game-screens'
import { PlayersCard } from './PlayersCard'
import { RoomCode } from './RoomCode'

type LobbyProps = {
  room: RoomView
  screens: GameScreens
  isTableScreen: boolean
  onStart: () => void
  onChangeSettings: (settings: unknown) => void
  onLeave?: () => void
}

/** Before the game: the code to get in, who's in, the game's few settings, and the one plate that starts it. */
export function Lobby({ room, screens, isTableScreen, onStart, onChangeSettings, onLeave }: LobbyProps) {
  const { t } = useTranslation()
  const { missing } = playersCard(room, screens.players)
  const Settings = screens.Settings
  return (
    <div
      className={
        isTableScreen ? 'grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start' : 'grid gap-6'
      }
    >
      <RoomCode code={room.code} size={isTableScreen ? 'huge' : 'big'} />
      <div className="grid gap-5">
        <PlayersCard room={room} players={screens.players} isLarge={isTableScreen} />
        <p className="w-fit text-sm ground-note">{t('room.seatsFor', { max: screens.players.max })}</p>
        {Settings && (
          <div className="rounded-[var(--radius-cell)] bg-frame-panel p-4 text-frame-text">
            <Settings settings={room.settings} onChange={onChangeSettings} />
          </div>
        )}
        <div className="grid gap-2">
          <Button look="plate" disabled={!room.canStart} onClick={onStart}>
            {t('room.start')}
          </Button>
          {missing > 0 && (
            <p aria-live="polite" className="mx-auto w-fit text-center font-semibold ground-note">
              {t('room.needMore', { count: missing })}
            </p>
          )}
        </div>
        {onLeave && (
          <Button width="fit" className="justify-self-center" onClick={onLeave}>
            {t('room.leave')}
          </Button>
        )}
      </div>
    </div>
  )
}
