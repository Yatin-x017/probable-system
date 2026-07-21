"use client";

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { pressable, springs } from '@/lib/motion'

export interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
  /** Visual state hook so the parent can flag a validation error, matching other form fields on this page. */
  error?: boolean
  /** Lets the parent know when the picker is open, e.g. to fade out nearby
   * hint copy while it's up. */
  onOpenChange?: (open: boolean) => void
}

/* ---------------------------------------------------------------------- */
/* Time math & formatting                                                 */
/* ---------------------------------------------------------------------- */

function adjustTime(timeStr: string, minutesToAdd: number): string {
  if (!timeStr || timeStr.length !== 5) return timeStr
  const [hours, minutes] = timeStr.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) return timeStr

  let totalMinutes = hours * 60 + minutes + minutesToAdd
  // Clamp between 00:00 and 23:59 instead of wrapping, so a run of clicks
  // near midnight can't silently loop back to the wrong side of the day.
  totalMinutes = Math.max(0, Math.min(1439, totalMinutes))

  const newHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
  const newMinutes = (totalMinutes % 60).toString().padStart(2, '0')
  return `${newHours}:${newMinutes}`
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = (timeStr || '00:00').split(':').map(Number)
  return { hours: isNaN(hours) ? 0 : hours, minutes: isNaN(minutes) ? 0 : minutes }
}

function pointOnCircle(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const ADJUSTMENTS = [
  { label: '-2h', val: -120 },
  { label: '-1h', val: -60 },
  { label: '-30m', val: -30 },
  { label: '-15m', val: -15 },
  { label: '+15m', val: 15 },
  { label: '+30m', val: 30 },
  { label: '+1h', val: 60 },
  { label: '+2h', val: 120 },
]

/**
 * A small analog clock face — purely a visual readout of the current value,
 * ticks marked at each hour, hour/minute hands pointing to the real time.
 */
function ClockFace({ hours, minutes }: { hours: number; minutes: number }) {
  const size = 128
  const cx = size / 2
  const cy = size / 2
  const hourAngle = ((hours % 12) + minutes / 60) * 30
  const minuteAngle = minutes * 6

  const hourHand = pointOnCircle(cx, cy, 30, hourAngle)
  const minuteHand = pointOnCircle(cx, cy, 46, minuteAngle)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mx-auto" aria-hidden>
      <circle cx={cx} cy={cy} r={58} className="fill-gray-50" stroke="currentColor" strokeWidth={1} style={{ color: 'rgb(0 0 0 / 0.08)' }} />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30
        const isCardinal = i % 3 === 0
        const outer = pointOnCircle(cx, cy, 56, angle)
        const inner = pointOnCircle(cx, cy, isCardinal ? 48 : 51, angle)
        return (
          <line
            key={i}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            strokeWidth={isCardinal ? 2 : 1.25}
            className={isCardinal ? 'stroke-gray-400' : 'stroke-gray-300'}
            strokeLinecap="round"
          />
        )
      })}
      {/* Hour hand */}
      <line x1={cx} y1={cy} x2={hourHand.x} y2={hourHand.y} strokeWidth={3.5} strokeLinecap="round" className="stroke-gray-900" />
      {/* Minute hand */}
      <line x1={cx} y1={cy} x2={minuteHand.x} y2={minuteHand.y} strokeWidth={2.5} strokeLinecap="round" className="stroke-sky" />
      <circle cx={cx} cy={cy} r={3.5} className="fill-gray-900" />
    </svg>
  )
}

/**
 * Time field that opens a small clock-face popover to adjust the value.
 * Built on the shared Popover primitive so positioning (flipping to fit the
 * viewport, closing on outside click/Escape, portalling above page content)
 * is handled the same way as every other popover in the app instead of
 * hand-rolled math.
 */
export function TimePicker({ value, onChange, className, error, onOpenChange }: TimePickerProps) {
  const { hours, minutes } = useMemo(() => parseTime(value), [value])

  const handleAdjust = (mins: number) => {
    onChange(adjustTime(value, mins))
  }

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <motion.button
          type="button"
          {...pressable}
          transition={springs.press}
          className={cn(
            'flex items-center gap-2 rounded-full bg-gray-50 pl-4 pr-5 py-3 text-lg font-semibold text-gray-900 tracking-wide',
            'ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-100',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
            'data-[state=open]:bg-white data-[state=open]:shadow-lg data-[state=open]:ring-gray-300',
            error && 'ring-coral text-coral',
            className
          )}
        >
          <Clock className="w-4 h-4 text-gray-400" aria-hidden />
          <span>{value}</span>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="center"
        sideOffset={16}
        collisionPadding={16}
        className="w-[19rem] rounded-3xl border-black/5 bg-white p-5 shadow-layer-lg"
      >
        <ClockFace hours={hours} minutes={minutes} />

        <div className="mt-3 text-center text-2xl font-bold tracking-wide text-gray-900">
          {value}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {ADJUSTMENTS.map((node) => {
            const isPos = node.val > 0
            return (
              <motion.button
                key={node.label}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                transition={springs.press}
                onClick={() => handleAdjust(node.val)}
                className={cn(
                  'flex h-10 items-center justify-center rounded-full border text-[11px] font-bold tracking-tight transition-colors',
                  isPos
                    ? 'bg-white text-sky border-sky-100 hover:bg-sky-50 hover:border-sky-200 active:bg-sky-100'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100'
                )}
              >
                {node.label}
              </motion.button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TimePicker
