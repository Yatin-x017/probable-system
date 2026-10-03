import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Cookie } from 'lucide-react'
import LegalPageLayout, { type LegalSection } from '@/components/legal/LegalPageLayout'
import { getCookie, setCookie } from '@/lib/cookies'
import { COOKIE_CONSENT_RESOLVED_EVENT } from '@/components/CookieConsent'
import { springs, pressable } from '@/lib/motion'

const EFFECTIVE_DATE = 'July 19, 2026'
const CONSENT_COOKIE = 'cookie_consent'

type Consent = 'all' | 'essential' | null

export default function CookiePreferences() {
  const [consent, setConsent] = useState<Consent>(null)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setConsent((getCookie(CONSENT_COOKIE) as Consent) ?? null)
  }, [])

  const respond = (value: 'all' | 'essential') => {
    setCookie(CONSENT_COOKIE, value, 365)
    setConsent(value)
    window.dispatchEvent(new Event(COOKIE_CONSENT_RESOLVED_EVENT))
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2400)
  }

  const sections: LegalSection[] = [
    {
      heading: 'What Each Choice Means',
      table: {
        headers: ['Choice', 'What it does'],
        rows: [
          [
            'Essential only',
            'Only the cookies required for the Site to remember your preference and your onboarding-tour status are set.',
          ],
          [
            'Accept all',
            'Same essential cookies, plus you\u2019ll see the onboarding tour offered on your next visit to the homepage if you haven\u2019t completed it yet.',
          ],
        ],
      },
    },
    {
      heading: 'The Cookies We Set',
      table: {
        headers: ['Cookie', 'Purpose', 'Duration'],
        rows: [
          ['cookie_consent', 'Stores the choice you make on this page', '365 days'],
          ['site_tour_status', 'Remembers whether you\u2019ve completed or skipped the onboarding tour', '365 days'],
        ],
      },
    },
    {
      heading: 'About Analytics',
      paragraphs: [
        'We use Vercel Analytics to see aggregate traffic patterns across the Site. It\u2019s designed to avoid tracking individual visitors and does not set a cookie, so it runs the same way regardless of the choice you make above.',
      ],
    },
    {
      heading: 'More Detail',
      paragraphs: [
        'For the full breakdown of what data we collect and how long we keep it, see our Data Policy and Privacy Policy.',
      ],
    },
  ]

  return (
    <LegalPageLayout
      title="Cookie Preferences"
      effectiveDate={EFFECTIVE_DATE}
      intro="Review or change how this Site uses cookies on your browser. Your choice is saved locally and applies only to this browser."
      sections={sections}
    >
      <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 w-9 h-9 rounded-full bg-sunny/20 flex items-center justify-center">
            <Cookie className="w-4.5 h-4.5 text-sunny-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Current preference:{' '}
              <span className="font-normal text-gray-600">
                {consent === 'all' && 'All cookies accepted'}
                {consent === 'essential' && 'Essential only'}
                {consent === null && 'Not set yet'}
              </span>
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <motion.button
                {...pressable}
                transition={springs.press}
                onClick={() => respond('essential')}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                  consent === 'essential'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                Essential only
              </motion.button>
              <motion.button
                {...pressable}
                transition={springs.press}
                onClick={() => respond('all')}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                  consent === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                Accept all
              </motion.button>

              <AnimatePresence>
                {justSaved && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={springs.smooth}
                    className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"
                  >
                    <Check className="w-4 h-4" />
                    Preference saved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Changing your mind later? Come back to this page any time — it's linked from the site footer.
        See also our{' '}
        <Link to="/data-policy" className="underline underline-offset-2 hover:text-gray-600">
          Data Policy
        </Link>
        .
      </p>
    </LegalPageLayout>
  )
}
