import { useCallback, useEffect, useState } from 'react'

// Client-side login throttling. This is a friction/UX layer only — it stops
// someone mashing the button in the browser, but Supabase's auth endpoint can
// still be hit directly, bypassing this entirely. Supabase Auth already rate
// limits sign-in attempts server-side (that boundary can't be configured from
// here); this just gives the person using the actual form clear feedback
// instead of letting them hammer "Sign In" indefinitely.

const STORAGE_KEY = 'admin_login_throttle'
const MAX_ATTEMPTS = 5
const BASE_LOCKOUT_MS = 30_000
const MAX_LOCKOUT_MS = 5 * 60_000

type ThrottleState = {
  attempts: number
  lockedUntil: number | null
}

function readState(): ThrottleState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { attempts: 0, lockedUntil: null }
    const parsed = JSON.parse(raw) as ThrottleState
    return { attempts: parsed.attempts ?? 0, lockedUntil: parsed.lockedUntil ?? null }
  } catch {
    return { attempts: 0, lockedUntil: null }
  }
}

function writeState(state: ThrottleState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — throttle just
    // won't persist across reloads, which is an acceptable degradation.
  }
}

export function useLoginAttemptLimiter() {
  const [state, setState] = useState<ThrottleState>(() => readState())
  const [now, setNow] = useState(() => Date.now())

  const isLocked = !!state.lockedUntil && state.lockedUntil > now
  const remainingSeconds = isLocked ? Math.ceil((state.lockedUntil! - now) / 1000) : 0

  // Tick once a second only while actually locked, so the countdown updates.
  useEffect(() => {
    if (!isLocked) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [isLocked])

  const recordFailure = useCallback(() => {
    setState((prev) => {
      const attempts = prev.attempts + 1
      let lockedUntil = prev.lockedUntil
      if (attempts >= MAX_ATTEMPTS) {
        const backoffMs = Math.min(BASE_LOCKOUT_MS * 2 ** (attempts - MAX_ATTEMPTS), MAX_LOCKOUT_MS)
        lockedUntil = Date.now() + backoffMs
      }
      const next = { attempts, lockedUntil }
      writeState(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const next = { attempts: 0, lockedUntil: null }
    writeState(next)
    setState(next)
  }, [])

  return { isLocked, remainingSeconds, recordFailure, reset }
}
