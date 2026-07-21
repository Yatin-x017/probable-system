import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCookie, setCookie } from '@/lib/cookies'
import { TOUR_STEPS } from '@/lib/tour/tourSteps'
import { COOKIE_CONSENT_RESOLVED_EVENT } from '@/components/CookieConsent'

const TOUR_COOKIE = 'site_tour_status' // 'done' | 'skipped'
const TOUR_COOKIE_DAYS = 365

interface TourContextValue {
  active: boolean
  finished: boolean
  stepIndex: number
  step: (typeof TOUR_STEPS)[number]
  totalSteps: number
  start: () => void
  next: () => void
  skip: () => void
  close: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}

export default function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  const [finished, setFinished] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-start for first-time visitors: no cookie means they've never
  // completed or dismissed the tour before. It waits for the cookie banner
  // to be resolved first (answered now, or already answered on a past
  // visit) so the two never stack on top of each other, then adds a short
  // settle delay before opening.
  useEffect(() => {
    const status = getCookie(TOUR_COOKIE)
    if (status || location.pathname !== '/') return

    let settleTimer: ReturnType<typeof setTimeout> | undefined
    const openTour = () => {
      settleTimer = setTimeout(() => setActive(true), 500)
    }

    if (getCookie('cookie_consent')) {
      openTour()
    } else {
      window.addEventListener(COOKIE_CONSENT_RESOLVED_EVENT, openTour, { once: true })
    }

    return () => {
      window.removeEventListener(COOKIE_CONSENT_RESOLVED_EVENT, openTour)
      if (settleTimer) clearTimeout(settleTimer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the URL in sync with whatever step is active.
  useEffect(() => {
    if (!active) return
    const step = TOUR_STEPS[stepIndex]
    if (step && step.path !== location.pathname) {
      navigate(step.path)
    }
  }, [active, stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    setFinished(false)
    setStepIndex(0)
    setActive(true)
    if (location.pathname !== '/') navigate('/')
  }

  const next = () => {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      setCookie(TOUR_COOKIE, 'done', TOUR_COOKIE_DAYS)
      setActive(false)
      setFinished(true)
      // The tour ends on the last stop's page (e.g. /book) — bring the
      // visitor back to the landing page so they land somewhere familiar.
      navigate('/')
      return
    }
    setStepIndex((i) => i + 1)
  }

  const skip = () => {
    setCookie(TOUR_COOKIE, 'skipped', TOUR_COOKIE_DAYS)
    setActive(false)
  }

  const close = () => setFinished(false)

  const value: TourContextValue = {
    active,
    finished,
    stepIndex,
    step: TOUR_STEPS[stepIndex],
    totalSteps: TOUR_STEPS.length,
    start,
    next,
    skip,
    close,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}
