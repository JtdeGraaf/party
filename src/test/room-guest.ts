import type { InMemoryHost } from '../../server/in-memory/in-memory-host'
import { serverMessageSchema, type RoomView, type ServerMessage } from '@/party/protocol'

/** Another phone or a table screen in the room, talking to the server directly, for tests of one screen. */
export class RoomGuest {
  readonly received: ServerMessage[] = []
  private readonly socket

  constructor(host: InMemoryHost, code: string) {
    this.socket = host.connect(code, (text) => this.received.push(serverMessageSchema.parse(JSON.parse(text))))
  }

  static async player(host: InMemoryHost, code: string, name: string): Promise<RoomGuest> {
    const guest = new RoomGuest(host, code)
    await guest.send({ type: 'hello', as: 'player', name, seatToken: null })
    return guest
  }

  static async table(host: InMemoryHost, code: string): Promise<RoomGuest> {
    const guest = new RoomGuest(host, code)
    await guest.send({ type: 'hello', as: 'table' })
    return guest
  }

  send(message: object): Promise<void> {
    return this.socket.sendToServer(JSON.stringify(message))
  }

  get view(): RoomView | undefined {
    return this.received.flatMap((message) => (message.type === 'view' ? [message.view] : [])).at(-1)
  }
}
