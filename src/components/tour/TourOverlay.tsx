import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X, ArrowRight, PartyPopper } from 'lucide-react'
import { useTour } from './TourProvider'
import Confetti from './Confetti'
import { springs } from '@/lib/motion'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

// Polls for the target element rather than relying on a single measurement,
// since after a route change the element mounts a beat after navigation
// (page transition + data fetch), not synchronously with the tour step.
function useTargetRect(targetId: string | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (!targetId) {
      setRect(null)
      return
    }
    let raf: number
    let cancelled = false

    const measure = () => {
      if (cancelled) return
      const el = document.querySelector(`[data-tour="${targetId}"]`)
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      } else {
        setRect(null)
      }
      raf = requestAnimationFrame(measure)
    }
    raf = requestAnimationFrame(measure)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [targetId])

  return rect
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? 'w-6 bg-sky' : i < current ? 'w-1.5 bg-sky/50' : 'w-1.5 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function TourOverlay() {
  const { active, finished, step, stepIndex, totalSteps, next, skip, close } = useTour()
  const rect = useTargetRect(step?.target ?? null)
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  return (
    <>
      {/* --- Active spotlight tour --- */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Glowing outline around the spotlighted element — no dark
                backdrop, the rest of the page stays fully visible and
                usable while the tour is active. */}
            {rect && (
              <motion.div
                className="absolute rounded-xl border-2 border-sunny pointer-events-none"
                style={{ boxShadow: '0 0 0 4px rgb(255 217 61 / 0.25), 0 0 28px 8px rgb(255 217 61 / 0.45)' }}
                animate={{
                  top: rect.top - 8,
                  left: rect.left - 8,
                  width: rect.width + 16,
                  height: rect.height + 16,
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  top: springs.smooth,
                  left: springs.smooth,
                  width: springs.smooth,
                  height: springs.smooth,
                  opacity: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            )}

            {/* Skip control, always available top-right */}
            <button
              onClick={skip}
              className="absolute top-5 right-5 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-black/5 hover:bg-gray-50 px-3 py-1.5 rounded-full shadow-layer-sm transition-colors pointer-events-auto"
            >
              Skip tour <X className="w-3.5 h-3.5" />
            </button>

            {/* Gamified step card */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 sm:pb-10 pointer-events-auto">
              <motion.div
                key={step?.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={springs.bouncy}
                className="w-full max-w-md bg-white rounded-2xl shadow-layer-lg border border-black/5 p-5"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky uppercase tracking-wide mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isFirst ? 'Site tour' : `Step ${stepIndex} of ${totalSteps - 1}`}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{step?.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{step?.description}</p>

                <div className="flex items-center justify-between">
                  <ProgressDots current={stepIndex} total={totalSteps} />
                  <button
                    onClick={next}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-full transition-colors"
                  >
                    {isFirst ? "Let's go" : isLast ? 'Finish' : 'Next'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Completion celebration --- */}
      <AnimatePresence>
        {finished && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springs.bouncy}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-layer-lg border border-black/5 p-6 text-center overflow-hidden"
            >
              <Confetti />
              <div className="relative mx-auto mb-3 w-14 h-14 rounded-full bg-sunny/20 flex items-center justify-center">
                <PartyPopper className="w-7 h-7 text-sunny-700" />
              </div>
              <h3 className="relative text-lg font-semibold text-gray-900 mb-1">That's the tour!</h3>
              <p className="relative text-sm text-gray-600 mb-5">
                You've seen everything the site has to offer. Back to the homepage you go.
              </p>
              <button
                onClick={close}
                className="relative w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-full transition-colors"
              >
                Continue exploring
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
