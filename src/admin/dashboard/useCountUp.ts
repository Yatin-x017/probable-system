import { useEffect, useRef, useState } from 'react'

// Ease-out cubic — starts fast, settles gently (feels less mechanical than linear)
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Animates a number counting up from 0 to `value` whenever `value` changes.
 * Skips the animation entirely for users who've asked for reduced motion.
 */
export function useCountUp(value: number, duration = 1100) {
  const [display, setDisplay] = useState(0)
  const frame = useRef<number>(0)
  const startValue = useRef(0)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || !Number.isFinite(value)) {
      setDisplay(value)
      return
    }

    const from = startValue.current
    const to = value
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const eased = easeOutCubic(progress)
      setDisplay(Math.round(from + (to - from) * eased))

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        startValue.current = to
      }
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return display
}
