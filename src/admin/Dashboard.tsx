import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, CalendarClock, Wallet, BarChart3, ArrowUpRight } from 'lucide-react'
import {
  getAllProjects,
  getAllPosts,
  getAllMessages,
  getAllBookings,
  getAllPayments,
  getAdminProfile,
} from '@/lib/supabase/api'
import { useAuth } from '@/hooks/useAuth'
import type { Database } from '@/types/supabase'

import { StatCard } from './dashboard/StatCard'
import { UpcomingBookings } from './dashboard/UpcomingBookings'
import { RecentActivity } from './dashboard/RecentActivity'
import { DashboardSkeleton } from './dashboard/DashboardSkeleton'

type Project = Database['public']['Tables']['projects']['Row']
type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
type Booking = Database['public']['Tables']['bookings']['Row']
type Payment = Database['public']['Tables']['payments']['Row']

function pickCurrency(payments: Payment[]) {
  const counts: Record<string, number> = {}
  for (const p of payments) {
    const c = (p.currency || 'INR').toUpperCase()
    counts[c] = (counts[c] || 0) + 1
  }
  const entries = Object.entries(counts)
  if (entries.length === 0) return 'INR'
  return entries.sort((a, b) => b[1] - a[1])[0][0]
}

function makeCurrencyFormatter(currency: string) {
  try {
    const fmt = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    return (n: number) => fmt.format(n)
  } catch {
    return (n: number) => `${currency} ${n.toLocaleString('en-IN')}`
  }
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState<string>('')
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [projectsRes, postsRes, messagesRes, bookingsRes, paymentsRes] = await Promise.all([
          getAllProjects(),
          getAllPosts(),
          getAllMessages(),
          getAllBookings(),
          getAllPayments(),
        ])
        if (cancelled) return
        setProjects(projectsRes)
        setPosts(postsRes)
        setMessages(messagesRes)
        setBookings(bookingsRes)
        setPayments(paymentsRes)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    getAdminProfile(user.id)
      .then((profile) => {
        if (cancelled) return
        const fallback = user.email?.split('@')[0] || 'there'
        const name = profile?.full_name || fallback.charAt(0).toUpperCase() + fallback.slice(1)
        setAdminName(name)
      })
      .catch(() => {
        const fallback = user.email?.split('@')[0] || 'there'
        setAdminName(fallback.charAt(0).toUpperCase() + fallback.slice(1))
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  const revenueSparkline = useMemo(() => {
    const paidWithDate = payments.filter((p) => p.status === 'paid' && p.paid_at)
    if (paidWithDate.length === 0) return []

    // Bucket paid revenue into the trailing 6 calendar months (oldest -> newest)
    // so the sparkline reads left-to-right the same way a revenue chart would.
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

    return months.map(({ year, month }) => {
      const total = paidWithDate
        .filter((p) => {
          const paidDate = new Date(p.paid_at as string)
          return paidDate.getFullYear() === year && paidDate.getMonth() === month
        })
        .reduce((sum, p) => sum + Number(p.amount), 0)
      return { label: `${year}-${month + 1}`, value: total }
    })
  }, [payments])

  const { messagesToday, bookingsPending, totalPaid, totalPending, revenueTrendPct, currency } =
    useMemo(() => {
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)

      const messagesToday = messages.filter(
        (m) => m.created_at && new Date(m.created_at) >= startOfToday
      ).length

      const bookingsPending = bookings.filter((b) => b.status === 'pending').length

      const totalPaid = payments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0)
      const totalPending = payments
        .filter((p) => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0)

      // Compare paid revenue in the last 30 days vs the 30 days before that
      const now = Date.now()
      const day = 24 * 60 * 60 * 1000
      const paidWithDate = payments.filter((p) => p.status === 'paid' && p.paid_at)
      const last30 = paidWithDate
        .filter((p) => now - new Date(p.paid_at as string).getTime() <= 30 * day)
        .reduce((sum, p) => sum + Number(p.amount), 0)
      const prev30 = paidWithDate
        .filter((p) => {
          const age = now - new Date(p.paid_at as string).getTime()
          return age > 30 * day && age <= 60 * day
        })
        .reduce((sum, p) => sum + Number(p.amount), 0)
      const revenueTrendPct = prev30 > 0 ? Math.round(((last30 - prev30) / prev30) * 100) : 0

      return {
        messagesToday,
        bookingsPending,
        totalPaid,
        totalPending,
        revenueTrendPct,
        currency: pickCurrency(payments),
      }
    }, [messages, bookings, payments])

  const formatMoney = useMemo(() => makeCurrencyFormatter(currency), [currency])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          {greeting}
          {adminName ? `, ${adminName}` : ''}
          <motion.span
            animate={{ rotate: [0, 18, -8, 18, 0] }}
            transition={{ duration: 1.4, delay: 0.3, ease: 'easeInOut' }}
            className="inline-block origin-[70%_70%]"
          >
            👋
          </motion.span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">Here's what's happening with your portfolio today.</p>
      </motion.div>

      {/* KPI row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          index={0}
          label="Blog Posts"
          value={posts.length}
          href="/admin/blog"
          icon={BarChart3}
          color="sky"
          subtext={posts.filter((p) => p.published).length + ' published'}
        />
        <StatCard
          index={1}
          label="Messages"
          value={messages.length}
          href="/admin/messages"
          icon={MessageSquare}
          color="coral"
          subtext={messagesToday > 0 ? `+${messagesToday} today` : undefined}
        />
        <StatCard
          index={2}
          label="Bookings"
          value={bookings.length}
          href="/admin/calendar"
          icon={CalendarClock}
          color="sunny"
          subtext={bookingsPending > 0 ? `${bookingsPending} pending` : undefined}
        />
        <StatCard
          index={3}
          label="Revenue"
          value={totalPaid}
          href="/admin/payments"
          icon={Wallet}
          color="fresh"
          formatValue={formatMoney}
          trendPct={revenueTrendPct}
          subtext={totalPending > 0 ? `${formatMoney(totalPending)} pending` : undefined}
          sparkline={revenueSparkline}
        />
      </div>

      {/* Traffic analytics — lives on Vercel, not duplicated here with fake numbers */}
      <a
        href="https://vercel.com/docs/analytics"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-card transition-colors hover:border-sky-200"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-sky-50 p-3">
            <BarChart3 className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Traffic Analytics</h2>
            <p className="text-sm text-gray-500">
              Pageviews, visitors, and device breakdowns are tracked by Vercel Web Analytics —
              open your project's Analytics tab on vercel.com to see live numbers.
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-gray-300" />
      </a>

      {/* Bookings timeline + messages */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingBookings bookings={bookings} />
        <RecentActivity messages={messages} />
      </div>

      {projects.length === 0 && (
        <p className="mt-6 text-center text-xs text-gray-300">
          Tip: add your first project from the Projects tab to start filling in real portfolio data.
        </p>
      )}
    </div>
  )
}
