import { useEffect, useState } from 'react'
import { Mail, MailOpen, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllMessages, markMessageAsRead } from '@/lib/supabase/api'
import type { Database } from '@/types/supabase'

type ContactMessage = Database['public']['Tables']['contact_messages']['Row']

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactMessage | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    try {
      const data = await getAllMessages()
      setMessages(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await markMessageAsRead(id)
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      )
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, read: true } : null))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8 h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount} unread of {messages.length} total
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex h-[calc(100%-5rem)]">
        {/* List */}
        <div className="w-80 border-r border-gray-100 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selected?.id === msg.id ? 'bg-gray-50' : ''
                  } ${!msg.read ? 'border-l-2 border-l-coral' : 'border-l-2 border-l-transparent'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {msg.read ? (
                        <MailOpen className="w-4 h-4 text-gray-300" />
                      ) : (
                        <Mail className="w-4 h-4 text-coral" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {msg.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {msg.message.slice(0, 60)}...
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <span className="text-[10px] text-gray-400">
                          {msg.created_at
                            ? new Date(msg.created_at).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selected.name}
                  </h2>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm text-sky hover:underline"
                  >
                    {selected.email}
                  </a>
                </div>
                {!selected.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(selected.id)}
                  >
                    <MailOpen className="w-4 h-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                Received:{' '}
                {selected.created_at
                  ? new Date(selected.created_at).toLocaleString()
                  : 'Unknown'}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
