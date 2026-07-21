import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { useCountUp } from './useCountUp'
import { Sparkline, type SparklinePoint } from './Sparkline'
import { cn } from '@/lib/utils'

// Full literal class names per color so Tailwind's scanner can find them
// (interpolated `bg-${color}-50` strings would get purged from the build).
const THEME = {
  sky: {
    iconBg: 'bg-sky-50',
    iconText: 'text-sky-600',
    hoverShadow: 'hover:shadow-glow-sky',
    hoverBorder: 'group-hover:border-sky-200',
  },
  coral: {
    iconBg: 'bg-coral-50',
    iconText: 'text-coral-600',
    hoverShadow: 'hover:shadow-glow-coral',
    hoverBorder: 'group-hover:border-coral-200',
  },
  sunny: {
    iconBg: 'bg-sunny-50',
    iconText: 'text-sunny-700',
    hoverShadow: 'hover:shadow-glow-sunny',
    hoverBorder: 'group-hover:border-sunny-200',
  },
  fresh: {
    iconBg: 'bg-fresh-50',
    iconText: 'text-fresh-700',
    hoverShadow: 'hover:shadow-glow-fresh',
    hoverBorder: 'group-hover:border-fresh-200',
  },
} as const

export type StatColor = keyof typeof THEME

interface StatCardProps {
  label: string
  value: number
  href?: string
  icon: LucideIcon
  color: StatColor
  subtext?: string
  trendPct?: number
  formatValue?: (n: number) => string
  index?: number
  sparkline?: readonly SparklinePoint[]
}

export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  color,
  subtext,
  trendPct,
  formatValue,
  index = 0,
  sparkline,
}: StatCardProps) {
  const animated = useCountUp(value)
  const theme = THEME[color]
  const display = formatValue ? formatValue(animated) : animated.toLocaleString('en-IN')

  const hasTrend = typeof trendPct === 'number' && Number.isFinite(trendPct) && trendPct !== 0
  const trendUp = (trendPct ?? 0) > 0

  const cardClassName = cn(
    'block rounded-xl border border-gray-200 bg-white p-5 shadow-card transition-all duration-300',
    theme.hoverShadow,
    theme.hoverBorder
  )

  const body = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className={cn('rounded-lg p-2 transition-transform duration-300 group-hover:scale-110', theme.iconBg)}>
          <Icon className={cn('h-5 w-5', theme.iconText)} />
        </div>
        {hasTrend && (
          <span
            className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              trendUp ? 'bg-fresh-50 text-fresh-700' : 'bg-coral-50 text-coral-600'
            )}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trendPct as number)}%
          </span>
        )}
      </div>

      <div className="text-2xl font-bold tabular-nums text-gray-900">{display}</div>
      <div className="mt-0.5 flex items-center justify-between text-sm text-gray-500">
        <span>{label}</span>
        {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
      </div>

      {sparkline && sparkline.length > 1 && (
        <div className={cn('mt-3', trendUp ? 'text-fresh-600' : 'text-coral-500')}>
          <Sparkline
            ariaLabel={`${label} trend`}
            data={sparkline}
            height={32}
            width={200}
            strokeWidth={1.75}
          />
        </div>
      )}
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group"
    >
      {href ? (
        <Link to={href} className={cardClassName}>
          {body}
        </Link>
      ) : (
        <div className={cardClassName}>{body}</div>
      )}
    </motion.div>
  )
}
