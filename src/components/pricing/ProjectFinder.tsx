import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UtensilsCrossed,
  Sparkles as SpaIcon,
  Martini,
  Scissors,
  ShoppingBag,
  Briefcase,
  Wand2,
  Compass,
  Palette,
  Code2,
  Rocket,
  LifeBuoy,
  Lock,
  Check,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { springs, staggerContainer, staggerItem, useRevealUp } from '@/lib/motion'
import { getPublishedProjects } from '@/lib/supabase/api'
import type { Database } from '@/types/supabase'

type Project = Database['public']['Tables']['projects']['Row']

interface BusinessType {
  id: string
  label: string
  icon: typeof UtensilsCrossed
  keywords: string[]
}

const BUSINESS_TYPES: BusinessType[] = [
  { id: 'restaurant', label: 'Restaurant / Cafe', icon: UtensilsCrossed, keywords: ['restaurant', 'cafe', 'food', 'menu'] },
  { id: 'spa', label: 'Spa / Wellness', icon: SpaIcon, keywords: ['spa', 'wellness', 'health'] },
  { id: 'bar', label: 'Bar / Lounge', icon: Martini, keywords: ['bar', 'lounge', 'nightlife'] },
  { id: 'salon', label: 'Salon / Beauty', icon: Scissors, keywords: ['salon', 'beauty', 'barber'] },
  { id: 'retail', label: 'Retail / Shop', icon: ShoppingBag, keywords: ['retail', 'shop', 'store', 'ecommerce'] },
  { id: 'services', label: 'Professional Services', icon: Briefcase, keywords: ['services', 'agency', 'consulting', 'professional'] },
  { id: 'other', label: 'Something else', icon: Wand2, keywords: [] },
]

type BookingNeed = 'simple' | 'booking' | 'custom'

const NEEDS: { id: BookingNeed; label: string; description: string }[] = [
  { id: 'simple', label: 'Just information', description: 'A clean site that tells people who you are and how to reach you.' },
  { id: 'booking', label: 'Bookings or orders', description: 'Clients or customers should be able to book, order, or pay online.' },
  { id: 'custom', label: 'Something custom', description: 'A specific tool, integration, or workflow built around my business.' },
]

const RECOMMENDED_TIER: Record<BookingNeed, string> = {
  simple: 'starter',
  booking: 'growth',
  custom: 'scale',
}

const JOURNEY_STEPS = [
  { title: 'Discovery Call', icon: Compass, xp: 'Level 1', copy: 'We map out what your site actually needs to do.' },
  { title: 'Design Sprint', icon: Palette, xp: 'Level 2', copy: 'Your brand, laid out and shaped into real pages.' },
  { title: 'Build', icon: Code2, xp: 'Level 3', copy: 'It gets built for real — fast, responsive, yours.' },
  { title: 'Launch', icon: Rocket, xp: 'Level 4', copy: 'Live, on your domain, ready for customers.' },
  { title: 'Support', icon: LifeBuoy, xp: 'Level 5', copy: 'Edits, small features, and help whenever you need it.' },
]

type Step = 'type' | 'needs' | 'results'

interface ProjectFinderProps {
  onRecommend: (tierId: string) => void
}

export default function ProjectFinder({ onRecommend }: ProjectFinderProps) {
  const [step, setStep] = useState<Step>('type')
  const [businessType, setBusinessType] = useState<BusinessType | null>(null)
  const [need, setNeed] = useState<BookingNeed | null>(null)
  const [matches, setMatches] = useState<Project[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const revealUp = useRevealUp()

  const stepIndex = step === 'type' ? 0 : step === 'needs' ? 1 : 2

  const selectType = (type: BusinessType) => {
    setBusinessType(type)
    setStep('needs')
  }

  const selectNeed = async (n: BookingNeed) => {
    setNeed(n)
    setStep('results')
    onRecommend(RECOMMENDED_TIER[n])
    if (!businessType || businessType.keywords.length === 0) return
    setLoadingMatches(true)
    try {
      const projects = await getPublishedProjects()
      const filtered = projects.filter((p) =>
        p.type?.some((t) => businessType.keywords.some((k) => t.toLowerCase().includes(k)))
      )
      setMatches(filtered.slice(0, 3))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMatches(false)
    }
  }

  const reset = () => {
    setStep('type')
    setBusinessType(null)
    setNeed(null)
    setMatches([])
  }

  return (
    <motion.div
      {...revealUp}
      className="relative rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-6 sm:p-10 mb-16 overflow-hidden"
    >
      {/* Header + progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">
            Not sure what fits?
          </p>
          <h2 className="text-xl font-semibold text-gray-900">
            Find your project match
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {['type', 'needs', 'results'].map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-1.5 w-10 rounded-full transition-colors duration-300',
                i <= stepIndex ? 'bg-gray-900' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'type' && (
          <motion.div
            key="type"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springs.smooth}
          >
            <p className="text-sm text-gray-500 mb-5">What kind of website do you want?</p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {BUSINESS_TYPES.map((type) => (
                <motion.button
                  key={type.id}
                  variants={staggerItem}
                  type="button"
                  onClick={() => selectType(type)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={springs.snappy}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white ring-1 ring-gray-200 px-4 py-6 text-center hover:ring-gray-300 hover:shadow-layer-sm transition-shadow"
                >
                  <type.icon className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-800">{type.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {step === 'needs' && (
          <motion.div
            key="needs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springs.smooth}
          >
            <p className="text-sm text-gray-500 mb-5">
              Good — a {businessType?.label.toLowerCase()} site. What does it need to do?
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {NEEDS.map((option) => (
                <motion.button
                  key={option.id}
                  variants={staggerItem}
                  type="button"
                  onClick={() => selectNeed(option.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={springs.snappy}
                  className="text-left rounded-xl bg-white ring-1 ring-gray-200 p-5 hover:ring-gray-300 hover:shadow-layer-sm transition-shadow"
                >
                  <span className="text-sm font-semibold text-gray-900">{option.label}</span>
                  <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{option.description}</p>
                </motion.button>
              ))}
            </motion.div>
            <button
              type="button"
              onClick={() => setStep('type')}
              className="mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {step === 'results' && businessType && need && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springs.smooth}
            className="space-y-10"
          >
            {/* Matched work */}
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Related work {businessType.keywords.length > 0 ? `for ${businessType.label.toLowerCase()}` : ''}
              </p>
              {loadingMatches ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {matches.map((project) => (
                    <Link
                      key={project.id}
                      to={`/work/${project.slug}`}
                      className="group block rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden hover:shadow-layer-sm hover:ring-gray-300 transition-all"
                    >
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                        {project.cover_image_url ? (
                          <img
                            src={project.cover_image_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-white ring-1 ring-gray-200 p-6 text-sm text-gray-500">
                  We haven't shipped one of these yet — yours could be the first.{' '}
                  <Link to="/work" className="text-gray-900 underline underline-offset-2">
                    See all work
                  </Link>
                </div>
              )}
            </div>

            {/* Gamified roadmap */}
            <div>
              <p className="text-sm text-gray-500 mb-5">Here's exactly what to expect</p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {JOURNEY_STEPS.map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springs.smooth, delay: i * 0.06 }}
                    className="relative rounded-xl bg-white ring-1 ring-gray-200 p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                        <s.icon className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                        {s.xp}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.copy}</p>
                    {i < JOURNEY_STEPS.length - 1 && (
                      <div className="hidden sm:block absolute top-8 -right-3 w-3 h-px bg-gray-200" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-gray-900 text-white p-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-fresh shrink-0" />
                <p className="text-sm">
                  Based on your answers, the{' '}
                  <span className="font-semibold capitalize">{RECOMMENDED_TIER[need]}</span> tier fits best —
                  scroll down, it's highlighted below.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake
                </button>
                <Button asChild className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link to="/book">
                    Book a call
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative lock icon on future steps, purely cosmetic reinforcement of the "game" framing */}
      {step !== 'results' && (
        <div className="absolute bottom-6 right-6 text-gray-200 pointer-events-none hidden lg:block">
          <Lock className="w-16 h-16" />
        </div>
      )}
    </motion.div>
  )
}
