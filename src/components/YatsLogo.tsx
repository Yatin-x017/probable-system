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
          d="M5.5 6.5 18 20 30.5 6.5M18 20v11"
          fill="none"
          stroke={light ? '#F6F1E8' : '#F05B43'}
          strokeWidth="5.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
          initial={draw ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M25.5 11.8v5.5"
          stroke={light ? '#F6F1E8' : '#182338'}
          strokeWidth="2.5"
          initial={draw ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.22, delay: 0.48, ease: 'easeOut' }}
        />
      </svg>
      {!compact && (
        <span className={`font-display text-[1.55rem] font-extrabold leading-none tracking-[-0.075em] ${light ? 'text-[#F6F1E8]' : 'text-[#182338]'}`}>
          yats<span className="text-[#F05B43]">.</span>
        </span>
      )}
    </span>
  )
}
