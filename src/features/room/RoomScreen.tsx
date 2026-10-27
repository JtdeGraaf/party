import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { GameScreens } from '@/games/game-screens'
import { screensFor } from '@/games/screens-registry'
import { cn } from '@/lib/utils'
import type { RoomCode } from '@/party/room-code'
import { GameArea } from './GameArea'
import { InviteSheet } from './InviteSheet'
import { Lobby } from './Lobby'
import { ProblemNotice } from './ProblemNotice'
import { RoomBar } from './RoomBar'
import { Arriving, RoomGone } from './RoomStates'
import { useGameName } from './useGameName'
import { useRoom, type RoomRole } from './useRoom'

type Panel = 'invite' | 'endGame' | null

/** One screen in a room: a player's phone, or the table screen everyone looks at. */
export function RoomScreen({ code, role }: { code: RoomCode; role: RoomRole }) {
  const room = useRoom(code, role)
  if (room.isGone) return <RoomGone code={code} />
  if (!room.view) return <Arriving />
  const screens = screensFor(room.view.game)
  if (!screens) return <RoomGone code={code} />
  return <RoomInWorld room={room} view={room.view} screens={screens} role={role} />
}

type RoomInWorldProps = {
  room: ReturnType<typeof useRoom>
  view: NonNullable<ReturnType<typeof useRoom>['view']>
  screens: GameScreens
  role: RoomRole
}

/** The room inside its game's world: the frame's bar, then the lobby or the game. */
function RoomInWorld({ room, view, screens, role }: RoomInWorldProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const gameName = useGameName(screens.id)
  const [panel, setPanel] = useState<Panel>(null)
  const isTableScreen = role === 'table'
  const canEndGame = view.phase === 'playing' && !view.isOver
  const { Backdrop } = screens

  function leave() {
    room.leave()
    void navigate({ to: '/' })
  }

  return (
    <div className={cn(screens.worldClass, 'relative isolate min-h-dvh bg-frame-ground text-frame-on-ground')}>
      {Backdrop && <Backdrop />}
      <RoomBar code={view.code} gameName={gameName} isConnected={room.isConnected} onInvite={() => setPanel('invite')}>
        {canEndGame && (
          <Button look="bar" width="fit" onClick={() => setPanel('endGame')}>
            {t('room.endGame')}
          </Button>
        )}
      </RoomBar>
      <main className={cn('mx-auto px-4 py-5', isTableScreen ? 'max-w-[110rem] lg:px-10' : 'max-w-xl md:max-w-3xl')}>
        {view.phase === 'lobby' ? (
          <Lobby
            room={view}
            screens={screens}
            isTableScreen={isTableScreen}
            onStart={room.start}
            onChangeSettings={room.changeSettings}
            onLeave={isTableScreen ? undefined : leave}
          />
        ) : (
          <GameArea
            room={view}
            screens={screens}
            isTableScreen={isTableScreen}
            sendMove={room.move}
            onPlayAgain={room.playAgain}
            onBackToRoom={room.endGame}
          />
        )}
      </main>
      <InviteSheet
        code={view.code}
        open={panel === 'invite'}
        onOpenChange={(open) => setPanel(open ? 'invite' : null)}
      />
      <ConfirmDialog
        open={panel === 'endGame'}
        title={t('room.endGameTitle')}
        confirmLabel={t('room.endGame')}
        onConfirm={() => {
          room.endGame()
          setPanel(null)
        }}
        onCancel={() => setPanel(null)}
      >
        <p>{t('room.endGameText')}</p>
      </ConfirmDialog>
      <ProblemNotice problem={room.problem} />
    </div>
  )
}
