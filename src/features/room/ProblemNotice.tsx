import type { Problem } from '@/party/problems'
import { useProblemText } from './useProblemText'

/** A refusal from the room or the game, said in words, for a few seconds. */
export function ProblemNotice({ problem }: { problem: Problem | null }) {
  const text = useProblemText(problem)
  if (text === null) return null
  return (
    <p
      role="alert"
      className="fixed inset-x-3 bottom-4 z-20 mx-auto max-w-md rounded-[var(--radius-cell)] bg-wrong px-4 py-3 text-center font-bold text-ball shadow-sheet"
    >
      {text}
    </p>
  )
}
