import type { ComponentType } from 'react'
import type { GameNamespace } from '@/i18n/resources'
import type { RoomView } from '@/party/protocol'

/** What every game screen gets from the room: the room itself, the game's own view, and a way to move. */
export type GameScreenProps = {
  room: RoomView
  /** The game's view as it came off the wire; each game checks it with its own view schema. */
  gameView: unknown
  /** True while a TV or laptop shows the table, so the phone can show only the private part. */
  hasTableScreen: boolean
  sendMove: (move: unknown) => void
}

export type GameSettingsProps = { settings: unknown; onChange: (settings: unknown) => void }

/**
 * A game's screens, as the hub needs them. Only `Phone` is required: without a `Table`, the table screen shows the
 * phone view as a watcher sees it.
 */
export type GameScreens = {
  id: GameNamespace
  players: { min: number; max: number }
  defaultSettings: unknown
  /** The CSS class that switches the frame into the game's world. */
  worldClass: string
  /** Drawn behind the whole room while it is in this game's world, such as a tablecloth. */
  Backdrop?: ComponentType
  /** A small drawing from the game's world, for the shelf. */
  Emblem: ComponentType<{ className?: string }>
  /** The rules in short, for the game's own page before a room is opened. */
  Rules: ComponentType
  /** The few settings a room is opened with, if the game has any. */
  Settings?: ComponentType<GameSettingsProps>
  Phone: ComponentType<GameScreenProps>
  Table?: ComponentType<GameScreenProps>
}
