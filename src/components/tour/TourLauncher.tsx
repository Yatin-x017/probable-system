import { Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTour } from './TourProvider'
import { pressable, springs } from '@/lib/motion'

export default function TourLauncher() {
  const { active, finished, start } = useTour()
  if (active || finished) return null

  return (
    <motion.button
      onClick={start}
      {...pressable}
      transition={springs.snappy}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2 bg-white text-gray-700 hover:text-gray-900 border border-black/5 shadow-layer-sm hover:shadow-layer-lg px-3.5 py-2.5 rounded-full text-xs font-semibold transition-shadow"
      aria-label="Take the site tour"
    >
      <Compass className="w-4 h-4 text-sky" />
      <span className="hidden sm:inline">Take the tour</span>
    </motion.button>
  )
}
