/** Where games get their luck from: a secure source on the server, a seeded one in tests. */
export type Random = {
  /** A whole number from 0 up to, not including, `size`. */
  below(size: number): number
}

type WebCrypto = { getRandomValues(array: Uint32Array): Uint32Array }

/** Random numbers from the platform's secure source, without the bias of a plain modulo. */
export const secureRandom: Random = {
  below(size) {
    const webCrypto = (globalThis as unknown as { crypto: WebCrypto }).crypto
    const limit = Math.floor(2 ** 32 / size) * size
    const buffer = new Uint32Array(1)
    do webCrypto.getRandomValues(buffer)
    while (buffer[0] >= limit)
    return buffer[0] % size
  },
}

/** The same numbers every time for the same seed (mulberry32), so a test can replay a shuffle. */
export function seededRandom(seed: number): Random {
  let current = seed >>> 0
  return {
    below(size) {
      current = (current + 0x6d2b79f5) >>> 0
      let mixed = current
      mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
      const fraction = ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32
      return Math.floor(fraction * size)
    },
  }
}

/** Shuffles a copy of `items` (Fisher–Yates). */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const other = random.below(index + 1)
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }
  return copy
}
