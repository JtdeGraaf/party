import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { RoomView } from '@/party/protocol'
import type { GameScreens } from '@/games/game-screens'

type GameAreaProps = {
  room: RoomView
  screens: GameScreens
  isTableScreen: boolean
  sendMove: (move: unknown) => void
  onPlayAgain: () => void
  onBackToRoom: () => void
}

/** A game being played: the game's own screen, and once it is over, the way to the next one. */
export function GameArea({ room, screens, isTableScreen, sendMove, onPlayAgain, onBackToRoom }: GameAreaProps) {
  const { t } = useTranslation()
  const Screen = isTableScreen ? (screens.Table ?? screens.Phone) : screens.Phone
  const isWatching = !isTableScreen && room.me?.seat === null
  return (
    <div className="grid gap-5">
      {isWatching && !room.isOver && (
        <p className="rounded-[var(--radius-cell)] bg-frame px-4 py-2 text-center font-bold text-frame-ink">
          {t('room.watchingGame')}
        </p>
      )}
      <Screen room={room} gameView={room.gameView} hasTableScreen={room.tableScreens > 0} sendMove={sendMove} />
      {room.isOver && (
        <div className="mx-auto grid w-full max-w-md gap-2">
          <Button look="plate" onClick={onPlayAgain}>
            {t('room.playAgain')}
          </Button>
          <Button onClick={onBackToRoom}>{t('room.backToRoom')}</Button>
        </div>
      )}
    </div>
  )
}
