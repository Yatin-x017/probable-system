import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllBookings } from '@/lib/supabase/api'
import type { Database } from '@/types/supabase'

type Booking = Database['public']['Tables']['bookings']['Row']

export default function AdminCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    loadBookings()
    // TODO: Check admin_profile.google_calendar_connected
  }, [])

  async function loadBookings() {
    try {
      const data = await getAllBookings()
      setBookings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Group bookings by date
  const grouped = bookings.reduce(
    (acc, booking) => {
      const date = new Date(booking.starts_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!acc[date]) acc[date] = []
      acc[date].push(booking)
      return acc
    },
    {} as Record<string, Booking[]>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your booking schedule
          </p>
        </div>
        {!connected && (
          <Button
            variant="outline"
            onClick={() => setConnected(true)}
            className="border-gray-200"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Connect Google Calendar
          </Button>
        )}
      </div>

      {connected && (
        <div className="mb-6 p-4 bg-fresh-50 border border-fresh-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-fresh shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Google Calendar connected
            </p>
            <p className="text-xs text-gray-500">
              Bookings will sync with your Google Calendar automatically.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No bookings yet
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Bookings will appear here when people schedule through your{' '}
            <Link to="/book" className="text-sky hover:underline">
              public booking page
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayBookings]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{date}</h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
                {dayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-sky-50 rounded-lg">
                        <Clock className="w-4 h-4 text-sky" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.purpose || 'No purpose specified'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(booking.starts_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          —{' '}
                          {new Date(booking.ends_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={`mailto:${booking.email}`}
                        className="text-xs text-sky hover:underline"
                      >
                        {booking.email}
                      </a>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-fresh-100 text-fresh'
                            : booking.status === 'cancelled'
                            ? 'bg-coral-100 text-coral'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Google Calendar Integration
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Connect your Google Calendar to automatically sync bookings and check
          availability in real-time. This requires OAuth setup in Google Cloud
          Console.
        </p>
        <a
          href="https://console.cloud.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-sky hover:underline"
        >
          Open Google Cloud Console
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
