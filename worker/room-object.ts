import { DurableObject } from 'cloudflare:workers'
import type { Connection, ConnectionIdentity, OpenResult } from '../server/hosting'
import { RoomServer } from '../server/room-server'
import { secureRandom } from '../src/party/random'

const ROOM_KEY = 'room'

/**
 * One room on Cloudflare: a Durable Object that hands its storage, alarm and WebSockets to the room server. The
 * sockets hibernate, so a quiet room costs nothing; who each socket is survives in its attachment.
 */
export class RoomObject extends DurableObject<object> {
  private readonly server: RoomServer
  private readonly connections = new WeakMap<WebSocket, Connection>()

  constructor(ctx: DurableObjectState, env: object) {
    super(ctx, env)
    this.server = new RoomServer({
      storage: {
        load: async () => (await ctx.storage.get(ROOM_KEY)) ?? null,
        save: (room) => ctx.storage.put(ROOM_KEY, room),
        deleteAll: () => ctx.storage.deleteAll(),
      },
      wakeups: {
        wakeAt: (time) => ctx.storage.setAlarm(time),
        cancel: () => ctx.storage.deleteAlarm(),
      },
      connections: () => ctx.getWebSockets().map((socket) => this.connectionFor(socket)),
      random: secureRandom,
      now: () => Date.now(),
    })
  }

  /** Called by the Worker when it creates a room under this object's code. */
  open(code: string, game: string, settings: unknown): Promise<OpenResult> {
    return this.server.open(code, game, settings)
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response(null, { status: 426 })
    const { 0: phoneEnd, 1: roomEnd } = new WebSocketPair()
    this.ctx.acceptWebSocket(roomEnd)
    return new Response(null, { status: 101, webSocket: phoneEnd })
  }

  async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    await this.server.receive(this.connectionFor(socket), typeof message === 'string' ? message : '')
  }

  async webSocketClose(socket: WebSocket): Promise<void> {
    await this.server.closed(this.connectionFor(socket))
    closeQuietly(socket)
  }

  async webSocketError(socket: WebSocket): Promise<void> {
    await this.server.closed(this.connectionFor(socket))
  }

  async alarm(): Promise<void> {
    await this.server.wake()
  }

  /** The same Connection for the same socket, so the room server can tell sockets apart. */
  private connectionFor(socket: WebSocket): Connection {
    const known = this.connections.get(socket)
    if (known) return known
    const connection: Connection = {
      send(text) {
        try {
          socket.send(text)
        } catch {
          // The socket is closing; the phone catches up with a fresh view when it reconnects.
        }
      },
      close: () => closeQuietly(socket),
      identity: () => (socket.deserializeAttachment() as ConnectionIdentity | null) ?? null,
      identify: (identity) => socket.serializeAttachment(identity),
    }
    this.connections.set(socket, connection)
    return connection
  }
}

function closeQuietly(socket: WebSocket): void {
  try {
    socket.close()
  } catch {
    // Already closed.
  }
}
