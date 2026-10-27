import type { RoomPlayerView, RoomView } from '@/party/protocol'

export type PlayerCell = { kind: 'player'; player: RoomPlayerView; isMe: boolean } | { kind: 'free'; index: number }

export type PlayersCard = {
  /** The seats of the game: who sits in them, then free cells up to the game's maximum. */
  cells: PlayerCell[]
  /** Everyone in the room who doesn't play this game. */
  watchers: RoomPlayerView[]
  /** How many more are needed before the game can start; 0 once there are enough. */
  missing: number
}

/**
 * The room as a bingo card. In the lobby the first to join fill the seats, as the server will seat them; once a game
 * runs, the seats are whoever the server seated.
 */
export function playersCard(room: RoomView, players: { min: number; max: number }): PlayersCard {
  const myId = room.me?.playerId ?? null
  const seated =
    room.phase === 'lobby'
      ? room.players.slice(0, players.max)
      : room.players
          .filter((player) => player.seat !== null)
          .sort((first, second) => (first.seat ?? 0) - (second.seat ?? 0))
  const seatedIds = new Set(seated.map((player) => player.id))
  const cells: PlayerCell[] = [
    ...seated.map((player) => ({ kind: 'player' as const, player, isMe: player.id === myId })),
    ...Array.from({ length: players.max - seated.length }, (_, index) => ({ kind: 'free' as const, index })),
  ]
  return {
    cells,
    watchers: room.players.filter((player) => !seatedIds.has(player.id)),
    missing: Math.max(0, players.min - room.players.length),
  }
}
