import { ws } from 'msw'
import { setupServer } from 'msw/node'
import { InMemoryHost } from '../../server/in-memory/in-memory-host'
import { seededRandom } from '@/party/random'

/**
 * The real room server, run in memory, behind the WebSocket address the app connects to. Tests talk to it through
 * the app like a phone would, and can sit more players or a table screen down through `host.connect`.
 */
export function startFakeRoomServer() {
  const host = new InMemoryHost({ random: seededRandom(11), now: () => Date.now() })
  const rooms = ws.link(/\/api\/rooms\/([A-Z]{4})\/socket$/)

  const server = setupServer(
    rooms.addEventListener('connection', ({ client }) => {
      const code = /\/api\/rooms\/([A-Z]{4})\/socket$/.exec(client.url.pathname)?.[1] ?? ''
      const socket = host.connect(code, (text) => client.send(text))
      client.addEventListener('message', (event) => void socket.sendToServer(String(event.data)))
      client.addEventListener('close', () => void socket.hangUp())
    }),
  )
  server.listen()
  return { host, stop: () => server.close() }
}
