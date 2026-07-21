import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, CalendarDays } from 'lucide-react'
import { isToday, isTomorrow, isPast, format, differenceInCalendarDays } from 'date-fns'
import type { Database } from '@/types/supabase'

type Booking = Database['public']['Tables']['bookings']['Row']

function dayLabel(date: Date) {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  const diff = differenceInCalendarDays(date, new Date())
  if (diff > 0 && diff < 7) return format(date, 'EEEE')
  return format(date, 'MMM d')
}

interface UpcomingBookingsProps {
  bookings: Booking[]
  loading?: boolean
}

export function UpcomingBookings({ bookings, loading }: UpcomingBookingsProps) {
  const grouped = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const relevant = bookings
      .filter((b) => new Date(b.starts_at) >= startOfToday && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 6)

    const groups: { label: string; items: Booking[] }[] = []
    for (const booking of relevant) {
      const label = dayLabel(new Date(booking.starts_at))
      const group = groups.find((g) => g.label === label)
      if (group) group.items.push(booking)
      else groups.push({ label, items: [booking] })
    }
    return groups
  }, [bookings])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h2>
        <Link to="/admin/calendar" className="text-sm text-gray-500 hover:text-gray-900">
          View calendar
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CalendarDays className="mb-2 h-8 w-8 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">No bookings yet</p>
          <p className="text-xs text-gray-400">New bookings will show up here as a timeline.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {group.label}
              </div>
              <div className="space-y-0">
                {group.items.map((booking, i) => {
                  const startsAt = new Date(booking.starts_at)
                  const done = isPast(startsAt)
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.35 }}
                      className="relative flex gap-3 py-2 pl-1"
                    >
                      {i < group.items.length - 1 && (
                        <span className="absolute left-[15px] top-8 h-full w-px bg-gray-100" />
                      )}
                      <span
                        className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                          done ? 'bg-fresh-50 text-fresh-700' : 'bg-sky-50 text-sky-600'
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : format(startsAt, 'HH:mm')}
                      </span>
                      <div className="min-w-0 pb-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {booking.purpose || 'Meeting'}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {booking.name} · {format(startsAt, 'h:mm a')}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
