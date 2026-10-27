import type { Problem } from '@/party/problems'

/** Where a refusal's words live: the hub's `errors.<code>`, or the game's own `<game>:errors.<code>`. */
export type ProblemKey = { namespace: string; key: string; values: Record<string, string | number> }

export function problemKey(problem: Problem): ProblemKey {
  const values = Object.fromEntries(problem.args.map((arg, index) => [String(index), arg]))
  if (problem.from === 'room') return { namespace: 'translation', key: `errors.${problem.code}`, values }
  return { namespace: problem.game, key: `errors.${problem.code}`, values }
}
