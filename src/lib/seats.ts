import type { RoomView } from '@/party/protocol'

/** The players' names by seat number, for games that speak of seats. */
export function namesBySeat(room: RoomView): string[] {
  const names: string[] = []
  for (const player of room.players) if (player.seat !== null) names[player.seat] = player.name
  return Array.from({ length: names.length }, (_, seat) => names[seat] ?? '')
}
