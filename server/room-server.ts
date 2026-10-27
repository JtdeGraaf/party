import { rulesFor } from '../src/games/rules-registry'
import type { AnyGameRules } from '../src/party/game-rules'
import { roomProblem, type Problem } from '../src/party/problems'
import { clientMessageSchema, readMessage, type ClientMessage, type ServerMessage } from '../src/party/protocol'
import {
  changeSettings,
  endGame,
  isExpired,
  isProblem,
  joinAsPlayer,
  leaveRoom,
  makeMove,
  nextWakeAt,
  openRoom,
  playAgain,
  roomStateSchema,
  startGame,
  viewRoom,
  wakeGame,
  type Actor,
  type Presence,
  type RoomResult,
  type RoomState,
} from '../src/party/room'
import type { Connection, OpenResult, RoomHosting } from './hosting'

type LoadedRoom = { room: RoomState; rules: AnyGameRules }

/**
 * Runs one room: reads every message, checks it against the room and the game's rules, stores the result and sends
 * each connection its own view. One message is handled at a time, in the order they arrive.
 */
export class RoomServer {
  private readonly hosting: RoomHosting
  private loaded: LoadedRoom | null = null
  private queue: Promise<unknown> = Promise.resolve()

  constructor(hosting: RoomHosting) {
    this.hosting = hosting
  }

  open(code: string, game: string, settings: unknown): Promise<OpenResult> {
    return this.inTurn(async () => {
      if (await this.load()) return 'taken'
      const rules = rulesFor(game)
      if (!rules) return 'unknownGame'
      const opened = openRoom(code, settings, this.context(rules))
      if (isProblem(opened)) return 'badSettings'
      await this.commit({ room: opened.room, rules })
      return 'opened'
    })
  }

  receive(connection: Connection, text: string): Promise<void> {
    return this.inTurn(async () => {
      const message = readMessage(clientMessageSchema, text)
      if (!message) return send(connection, { type: 'problem', problem: roomProblem('badMessage') })
      const loaded = await this.load()
      if (!loaded) {
        send(connection, { type: 'problem', problem: roomProblem('roomNotFound') })
        return connection.close()
      }
      await this.handle(connection, message, loaded)
    })
  }

  /** A connection went away: the others see that player as not connected. */
  closed(connection: Connection): Promise<void> {
    return this.inTurn(async () => {
      const loaded = await this.load()
      if (loaded) this.sendViews(loaded, connection)
    })
  }

  /** The room's alarm went off: run the game's wake-up, or throw the room away once it expired. */
  wake(): Promise<void> {
    return this.inTurn(async () => {
      const loaded = await this.load()
      if (!loaded) return
      const now = this.hosting.now()
      if (isExpired(loaded.room, now)) {
        await this.hosting.storage.deleteAll()
        this.loaded = null
        for (const connection of this.hosting.connections()) connection.close()
        return
      }
      const room = wakeGame(loaded.room, this.context(loaded.rules))
      await this.commit({ room, rules: loaded.rules })
      // The alarm that woke us is used up, even when nothing changed.
      await this.hosting.wakeups.wakeAt(nextWakeAt(room))
    })
  }

  private async handle(connection: Connection, message: ClientMessage, loaded: LoadedRoom): Promise<void> {
    if (message.type === 'hello' && message.as === 'table') {
      connection.identify({ as: 'table' })
      return this.sendViews(loaded)
    }
    if (message.type === 'hello') {
      const joined = joinAsPlayer(loaded.room, message, this.context(loaded.rules))
      if ('problem' in joined) return refuse(connection, joined.problem)
      connection.identify({ as: 'player', playerId: joined.player.id })
      send(connection, { type: 'welcome', playerId: joined.player.id, seatToken: joined.player.seatToken })
      return this.commit({ room: joined.room, rules: loaded.rules })
    }

    const actor = connection.identity()
    if (!actor) return refuse(connection, roomProblem('notInRoom'))
    if (message.type === 'refresh') return send(connection, this.viewMessage(loaded, actor, this.presence()))

    const result = this.apply(loaded, actor, message)
    if (isProblem(result)) return refuse(connection, result.problem)
    await this.commit({ room: result.room, rules: loaded.rules })
  }

  private apply(loaded: LoadedRoom, actor: Actor, message: Exclude<ClientMessage, { type: 'hello' | 'refresh' }>) {
    const { room, rules } = loaded
    const context = this.context(rules)
    const playerOnly = (action: (playerId: string) => RoomResult): RoomResult =>
      actor.as === 'player' ? action(actor.playerId) : { problem: roomProblem('notSeated') }

    switch (message.type) {
      case 'settings':
        return changeSettings(room, actor, message.settings, context)
      case 'start':
        return startGame(room, actor, context)
      case 'play-again':
        return playAgain(room, actor, context)
      case 'end-game':
        return endGame(room, actor, context)
      case 'move':
        return playerOnly((playerId) => makeMove(room, playerId, message.move, context))
      case 'leave':
        return playerOnly((playerId) => leaveRoom(room, playerId, context))
    }
  }

  private async commit(loaded: LoadedRoom): Promise<void> {
    if (this.loaded?.room === loaded.room) return
    this.loaded = loaded
    await this.hosting.storage.save(loaded.room)
    await this.hosting.wakeups.wakeAt(nextWakeAt(loaded.room))
    this.sendViews(loaded)
  }

  private sendViews(loaded: LoadedRoom, leaving?: Connection): void {
    const presence = this.presence(leaving)
    for (const connection of this.openConnections(leaving)) {
      const actor = connection.identity()
      if (actor) send(connection, this.viewMessage(loaded, actor, presence))
    }
  }

  private viewMessage(loaded: LoadedRoom, actor: Actor, presence: Presence): ServerMessage {
    return { type: 'view', view: viewRoom(loaded.room, actor, presence, loaded.rules) }
  }

  private presence(leaving?: Connection): Presence {
    const identities = this.openConnections(leaving).flatMap((connection) => connection.identity() ?? [])
    return {
      connectedPlayerIds: new Set(
        identities.flatMap((identity) => (identity.as === 'player' ? [identity.playerId] : [])),
      ),
      tableScreens: identities.filter((identity) => identity.as === 'table').length,
    }
  }

  private openConnections(leaving?: Connection): Connection[] {
    return this.hosting.connections().filter((connection) => connection !== leaving)
  }

  /** The room from memory, or from storage after the host put it to sleep. Stored rooms are checked, not trusted. */
  private async load(): Promise<LoadedRoom | null> {
    if (this.loaded) return this.loaded
    const stored = roomStateSchema.safeParse(await this.hosting.storage.load())
    if (!stored.success) return null
    const rules = rulesFor(stored.data.game)
    if (!rules) return null
    if (stored.data.phase === 'playing' && !rules.stateSchema.safeParse(stored.data.gameState).success) return null
    this.loaded = { room: stored.data, rules }
    return this.loaded
  }

  private context(rules: AnyGameRules) {
    return { rules, random: this.hosting.random, now: this.hosting.now() }
  }

  private inTurn<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(task)
    this.queue = result.catch(() => undefined)
    return result
  }
}

function send(connection: Connection, message: ServerMessage): void {
  connection.send(JSON.stringify(message))
}

function refuse(connection: Connection, problem: Problem): void {
  send(connection, { type: 'problem', problem })
}
