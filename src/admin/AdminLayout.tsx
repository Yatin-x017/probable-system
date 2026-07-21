import { useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/supabase/client'
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock'
import AdminCommandPalette from './AdminCommandPalette'
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  MessageSquare,
  Calendar,
  CreditCard,
  LogOut,
  Loader2,
  PenSquare,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: PenSquare, label: 'Content', href: '/admin/content' },
  { icon: FolderOpen, label: 'Projects', href: '/admin/projects' },
  { icon: FileText, label: 'Blog', href: '/admin/blog' },
  { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
  { icon: Calendar, label: 'Calendar', href: '/admin/calendar' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
]

export default function AdminLayout() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { replace: true, state: { from: location } })
    }
  }, [user, loading, navigate, location])

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminCommandPalette onSignOut={handleSignOut} />
      {/* Sidebar — desktop/tablet only. Phones get the bottom Dock instead. */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <Link to="/admin" className="text-lg font-semibold text-gray-900">
            Admin
          </Link>
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
            aria-label="Open command palette"
          >
            <span>⌘</span>K
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2 text-xs text-gray-400 truncate mb-2">
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content — no left margin on phones (no sidebar there), extra
          bottom padding so content never sits under the floating Dock. */}
      <main className="flex-1 pb-28 md:pb-0 md:ml-64">
        <Outlet />
      </main>

      {/* Phone-only bottom Dock nav. Hidden from md breakpoint up, where the
          sidebar takes over. Magnification is a pointer enhancement — on
          touch it just behaves as a normal fixed bottom nav bar. */}
      <div className="md:hidden fixed bottom-3 inset-x-0 z-50 flex justify-center px-3">
        <Dock magnification={64} distance={110} panelHeight={56}>
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.href)
            return (
              <Link key={item.href} to={item.href} aria-label={item.label}>
                <DockItem
                  className={`rounded-full ${
                    isActive ? 'bg-gray-900' : 'bg-gray-100'
                  }`}
                >
                  <DockLabel>{item.label}</DockLabel>
                  <DockIcon>
                    <item.icon
                      className={`size-full ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`}
                    />
                  </DockIcon>
                </DockItem>
              </Link>
            )
          })}
          <button onClick={handleSignOut} aria-label="Sign out">
            <DockItem className="rounded-full bg-gray-100">
              <DockLabel>Sign Out</DockLabel>
              <DockIcon>
                <LogOut className="size-full text-gray-600" />
              </DockIcon>
            </DockItem>
          </button>
        </Dock>
      </div>
    </div>
  )
}
