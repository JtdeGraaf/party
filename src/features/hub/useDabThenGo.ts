import { useEffect, useRef, useState, type MouseEvent } from 'react'

/** Long enough to see the ink land before the next page, short enough not to feel like waiting. */
const DAB_SHOWS_MS = 260

/**
 * Stamps the dauber on what was picked, then goes. A click with a modifier key (open in a new tab) is left to the
 * browser, so it goes straight away.
 */
export function useDabThenGo(go: () => void) {
  const [isDabbed, setIsDabbed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  function onClick(event: MouseEvent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setIsDabbed(true)
    timer.current = setTimeout(go, DAB_SHOWS_MS)
  }

  return { isDabbed, onClick }
}
