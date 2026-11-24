import { motion, useReducedMotion } from 'framer-motion'

type YatsLogoProps = {
  className?: string
  compact?: boolean
  animated?: boolean
  light?: boolean
}

/** The Yats wordmark: a solid, drawn-in Y and a tightly set name. */
export default function YatsLogo({ className = '', compact = false, animated = false, light = false }: YatsLogoProps) {
  const reducedMotion = useReducedMotion()
  const draw = animated && !reducedMotion

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Yats">
      <svg aria-hidden="true" viewBox="0 0 36 36" className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
        <motion.path
          d="M4.5 6.5 16.3 20 28.5 6.5M16.3 20 13 27.2C11.2 31.3 8.5 33.1 4.5 32.1"
          fill="none"
          stroke={light ? '#F8F6F1' : '#D24B3E'}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={draw ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {!compact && (
        <motion.span
          initial={draw ? { opacity: 0, x: -4 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className={`font-display text-[1.55rem] font-extrabold leading-none tracking-[-0.075em] ${light ? 'text-[#F8F6F1]' : 'text-[#121212]'}`}
        >
          yats<span className="text-[#D24B3E]">.</span>
        </motion.span>
      )}
    </span>
  )
}
