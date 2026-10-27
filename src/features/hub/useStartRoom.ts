import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createRoom, RoomRequestError } from '@/api/rooms'
import type { GameScreens } from '@/games/game-screens'
import { saveName } from '@/lib/saved-seats'

type StartProblem = 'offline' | 'refused'

/** Opens a room for a game, then takes this screen into it: as a player's phone, or as the table screen. */
export function useStartRoom(screens: GameScreens) {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<unknown>(screens.defaultSettings)
  const [isOpening, setIsOpening] = useState(false)
  const [problem, setProblem] = useState<StartProblem | null>(null)

  async function open(asTable: boolean) {
    setIsOpening(true)
    setProblem(null)
    try {
      const code = await createRoom(screens.id, settings)
      if (asTable) return void navigate({ to: '/table/$code', params: { code } })
      void navigate({ to: '/room/$code', params: { code } })
    } catch (error) {
      setProblem(error instanceof RoomRequestError ? error.code : 'offline')
      setIsOpening(false)
    }
  }

  return {
    settings,
    setSettings,
    isOpening,
    problem,
    openOnPhone: (name: string) => {
      saveName(localStorage, name)
      return open(false)
    },
    openOnTable: () => open(true),
  }
}
