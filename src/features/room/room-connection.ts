import { WebSocket as ReconnectingWebSocket } from 'partysocket'
import { roomSocketUrl } from '@/api/rooms'
import { readMessage, serverMessageSchema, type ClientMessage, type ServerMessage } from '@/party/protocol'
import type { RoomCode } from '@/party/room-code'

export type ConnectionStatus = 'connecting' | 'open'

type Listeners = {
  onMessage: (message: ServerMessage) => void
  onStatus: (status: ConnectionStatus) => void
}

export type RoomConnection = {
  /** Sends now, or drops the message while the socket is down: the phone shows it is reconnecting meanwhile. */
  send: (message: ClientMessage) => void
  stop: () => void
}

/** How often a phone asks for the latest view anyway, in case one slipped past while it was in a pocket. */
const REFRESH_EVERY_MS = 15_000

/**
 * The only place that opens a socket to a room. It says hello again after every reconnect, which puts the phone back
 * in its seat, and asks for a fresh view whenever the page comes back into sight.
 */
export function openRoomConnection(code: RoomCode, hello: () => ClientMessage, listeners: Listeners): RoomConnection {
  const socket = new ReconnectingWebSocket(roomSocketUrl(code))
  const isOpen = () => socket.readyState === WebSocket.OPEN
  const send = (message: ClientMessage) => {
    if (isOpen()) socket.send(JSON.stringify(message))
  }

  socket.addEventListener('open', () => {
    listeners.onStatus('open')
    send(hello())
  })
  socket.addEventListener('close', () => listeners.onStatus('connecting'))
  socket.addEventListener('message', (event: MessageEvent) => {
    const message = readMessage(serverMessageSchema, String(event.data))
    if (message) listeners.onMessage(message)
  })

  const catchUp = () => {
    if (document.visibilityState !== 'visible') return
    if (isOpen()) return send({ type: 'refresh' })
    socket.reconnect()
  }
  document.addEventListener('visibilitychange', catchUp)
  const timer = setInterval(catchUp, REFRESH_EVERY_MS)

  return {
    send,
    stop() {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', catchUp)
      socket.close()
    },
  }
}
