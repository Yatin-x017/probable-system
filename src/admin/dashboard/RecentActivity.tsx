import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/supabase'

type ContactMessage = Database['public']['Tables']['contact_messages']['Row']

const AVATAR_COLORS = ['bg-sky-500', 'bg-coral-500', 'bg-fresh-500', 'bg-sunny-500']

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function avatarColor(name: string) {
  const hash = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

interface RecentActivityProps {
  messages: ContactMessage[]
  loading?: boolean
}

export function RecentActivity({ messages, loading }: RecentActivityProps) {
  const recent = useMemo(() => messages.slice(0, 5), [messages])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
        <Link to="/admin/messages" className="text-sm text-gray-500 hover:text-gray-900">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Inbox className="mb-2 h-8 w-8 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">No messages yet</p>
          <p className="text-xs text-gray-400">Messages from your contact form land here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {recent.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(
                  msg.name
                )}`}
              >
                {initials(msg.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">{msg.name}</p>
                  <span className="shrink-0 text-xs text-gray-400">
                    {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }) : ''}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-500">{msg.message}</p>
              </div>
              {!msg.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral-500" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
