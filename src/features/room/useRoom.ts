import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { forgetSeat, readSavedName, readSavedSeat, saveSeat } from '@/lib/saved-seats'
import type { Problem } from '@/party/problems'
import type { ClientMessage, RoomView, ServerMessage } from '@/party/protocol'
import type { RoomCode } from '@/party/room-code'
import { openRoomConnection, type ConnectionStatus, type RoomConnection } from './room-connection'

/** How long a refusal ("not your turn") stays on screen. */
const PROBLEM_SHOWS_MS = 5_000

export type RoomRole = 'player' | 'table'

type RoomState = {
  view: RoomView | null
  status: ConnectionStatus
  problem: Problem | null
  /** The room doesn't exist (any more): stop trying. */
  isGone: boolean
}

/** Connects this screen to a room as a player's phone or as the table screen, and keeps the latest view. */
export function useRoom(code: RoomCode, role: RoomRole) {
  const [state, setState] = useState<RoomState>({ view: null, status: 'connecting', problem: null, isGone: false })
  const connection = useRef<RoomConnection | null>(null)

  useEffect(() => {
    const hello = (): ClientMessage =>
      role === 'table'
        ? { type: 'hello', as: 'table' }
        : {
            type: 'hello',
            as: 'player',
            name: readSavedName(localStorage) ?? '',
            seatToken: readSavedSeat(localStorage, code)?.seatToken ?? null,
          }

    const onMessage = (message: ServerMessage) => {
      if (message.type === 'welcome') {
        saveSeat(localStorage, code, { playerId: message.playerId, seatToken: message.seatToken })
        return
      }
      if (message.type === 'view') {
        // A phone can get an older view after a newer one when it reconnects mid-change; keep the newest.
        setState((current) =>
          current.view && current.view.version > message.view.version
            ? current
            : { ...current, view: message.view, isGone: false },
        )
        return
      }
      const isGone = message.problem.from === 'room' && message.problem.code === 'roomNotFound'
      if (isGone) opened.stop()
      setState((current) => ({ ...current, problem: message.problem, isGone: current.isGone || isGone }))
    }

    const opened = openRoomConnection(code, hello, {
      onMessage,
      onStatus: (status) => setState((current) => ({ ...current, status })),
    })
    connection.current = opened
    return () => opened.stop()
  }, [code, role])

  useEffect(() => {
    if (!state.problem) return
    const timer = setTimeout(() => setState((current) => ({ ...current, problem: null })), PROBLEM_SHOWS_MS)
    return () => clearTimeout(timer)
  }, [state.problem])

  const send = useCallback((message: ClientMessage) => connection.current?.send(message), [])

  const actions = useMemo(
    () => ({
      start: () => send({ type: 'start' }),
      move: (move: unknown) => send({ type: 'move', move }),
      changeSettings: (settings: unknown) => send({ type: 'settings', settings }),
      playAgain: () => send({ type: 'play-again' }),
      endGame: () => send({ type: 'end-game' }),
      /** Gives up this phone's place in the room; the phone forgets its seat too. */
      leave: () => {
        send({ type: 'leave' })
        forgetSeat(localStorage, code)
      },
    }),
    [send, code],
  )

  return { ...state, isConnected: state.status === 'open', ...actions }
}
