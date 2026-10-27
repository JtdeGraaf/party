import type { RoomDirectory } from '../server/hosting'
import { createRoom, CREATE_ROOM_PATH, roomOfSocketPath } from '../server/create-room'
import { secureRandom } from '../src/party/random'
import type { RoomObject } from './room-object'

export { RoomObject } from './room-object'

type Env = { ROOMS: DurableObjectNamespace<RoomObject> }

/** Every room code maps to one Durable Object, wherever in the world Cloudflare keeps it. */
function roomsOn(env: Env): RoomDirectory {
  return {
    open: (code, game, settings) => env.ROOMS.get(env.ROOMS.idFromName(code)).open(code, game, settings),
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)

    if (pathname === CREATE_ROOM_PATH && request.method === 'POST') {
      const body = await request.json().catch(() => null)
      const answer = await createRoom(roomsOn(env), body, secureRandom)
      return Response.json(answer.body, { status: answer.status })
    }

    const code = roomOfSocketPath(pathname)
    if (code) return env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(request)

    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<Env>
