import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { getCookie, setCookie } from '@/lib/cookies'
import { springs, pressable } from '@/lib/motion'

const CONSENT_COOKIE = 'cookie_consent' // 'all' | 'essential'
const CONSENT_COOKIE_DAYS = 365

// Fired the moment the visitor answers the cookie banner (or immediately, if
// they'd already answered on a previous visit). The site tour listens for
// this so it never pops up on top of — or gets stacked under — the cookie
// banner; see TourProvider.
export const COOKIE_CONSENT_RESOLVED_EVENT = 'cookie-consent-resolved'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Already answered on a previous visit — nothing to show, and the tour
    // (which waits on this same event) is free to run right away.
    if (getCookie(CONSENT_COOKIE)) {
      window.dispatchEvent(new Event(COOKIE_CONSENT_RESOLVED_EVENT))
      return
    }
    // Small delay so it doesn't compete with the hero for attention on first
    // paint — shows up once the page has settled.
    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const respond = (value: 'all' | 'essential') => {
    setCookie(CONSENT_COOKIE, value, CONSENT_COOKIE_DAYS)
    setVisible(false)
    window.dispatchEvent(new Event(COOKIE_CONSENT_RESOLVED_EVENT))
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[90] flex justify-center px-4 pb-4 sm:pb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={springs.smooth}
          role="dialog"
          aria-label="Cookie preferences"
        >
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-layer-lg border border-black/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:flex-1">
              <div className="shrink-0 mt-0.5 w-9 h-9 rounded-full bg-sunny/20 flex items-center justify-center">
                <Cookie className="w-4.5 h-4.5 text-sunny-700" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-900">This website uses cookies. </span>
                Just the essentials to remember your preferences — nothing sold to third parties.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <motion.button
                {...pressable}
                transition={springs.press}
                onClick={() => respond('essential')}
                className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-2 rounded-full transition-colors"
              >
                Essential only
              </motion.button>
              <motion.button
                {...pressable}
                transition={springs.press}
                onClick={() => respond('all')}
                className="text-xs sm:text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-full transition-colors"
              >
                Accept
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
