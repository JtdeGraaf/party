import { describe, expect, it } from 'vitest'
import { isGameProblem, type GameRules, type Viewer } from '@/party/game-rules'
import { seededRandom, type Random } from '@/party/random'

export type ContractSamples<State, Move, Settings> = {
  settings: Settings
  /** A legal move for the state, picked at random, so the contract can play whole games. */
  pickMove(state: State, random: Random): { seat: number; move: Move }
  /** Safety net for games that could run long: give up after this many moves. */
  maxMoves?: number
}

/**
 * The tests every game in the hub must pass, whatever it is: it starts for every player count it allows, its state
 * survives being stored, it builds a valid view for every kind of viewer, refuses seats that don't exist, and random
 * legal play gets to the end.
 */
export function describeGameRules<State, Move, Settings, View>(
  rules: GameRules<State, Move, Settings, View>,
  samples: ContractSamples<State, Move, Settings>,
) {
  const seatCounts = Array.from(
    { length: rules.players.max - rules.players.min + 1 },
    (_, index) => rules.players.min + index,
  )

  function viewersFor(seats: number): Viewer[] {
    return [
      { as: 'table' },
      { as: 'watcher' },
      ...Array.from({ length: seats }, (_, seat) => ({ as: 'seat' as const, seat })),
    ]
  }

  function checkStorableAndViewable(state: State, seats: number) {
    const stored = rules.stateSchema.parse(JSON.parse(JSON.stringify(state)))
    expect(stored).toEqual(state)
    for (const viewer of viewersFor(seats)) {
      expect(rules.viewSchema.safeParse(JSON.parse(JSON.stringify(rules.view(state, viewer)))).success).toBe(true)
    }
  }

  describe(`${rules.id} follows the game contract`, () => {
    it('accepts its own default settings', () => {
      expect(rules.settingsSchema.safeParse(rules.defaultSettings).success).toBe(true)
    })

    it.each(seatCounts)('starts with %i players, storable and viewable', (seats) => {
      const { state } = rules.start({
        seats,
        settings: samples.settings,
        gameNumber: 1,
        random: seededRandom(seats),
        now: 0,
      })

      checkStorableAndViewable(state, seats)
      expect(rules.isOver(state)).toBe(false)
    })

    it('refuses a move from a seat that does not exist', () => {
      const seats = rules.players.min
      const random = seededRandom(1)
      const { state } = rules.start({ seats, settings: samples.settings, gameNumber: 1, random, now: 0 })
      const { move } = samples.pickMove(state, random)

      expect(isGameProblem(rules.move(state, { seat: seats, move, random, now: 0 }))).toBe(true)
    })

    it.each(seatCounts)('plays a random game with %i players to the end', (seats) => {
      const random = seededRandom(seats * 31)
      let { state } = rules.start({ seats, settings: samples.settings, gameNumber: 1, random, now: 0 })
      const maxMoves = samples.maxMoves ?? 5000

      for (let moves = 0; moves < maxMoves && !rules.isOver(state); moves++) {
        const { seat, move } = samples.pickMove(state, random)
        expect(rules.moveSchema.safeParse(move).success).toBe(true)
        const result = rules.move(state, { seat, move, random, now: moves })
        if (isGameProblem(result)) throw new Error(`picked an illegal move: ${JSON.stringify({ seat, move, result })}`)
        state = result.state
      }

      expect(rules.isOver(state)).toBe(true)
      checkStorableAndViewable(state, seats)
    })
  })
}
