// Global ⌘K / Ctrl+K command palette for the admin. Lives once in
// AdminLayout so it's available from every admin screen.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  MessageSquare,
  Calendar,
  CreditCard,
  PenSquare,
  LogOut,
  Plus,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

type Props = {
  onSignOut: () => void
}

const navCommands = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: PenSquare, label: 'Content', href: '/admin/content' },
  { icon: FolderOpen, label: 'Projects', href: '/admin/projects' },
  { icon: FileText, label: 'Blog', href: '/admin/blog' },
  { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
  { icon: Calendar, label: 'Calendar', href: '/admin/calendar' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
]

const actionCommands = [
  { icon: Plus, label: 'New Project', href: '/admin/projects/new' },
  { icon: Plus, label: 'New Blog Post', href: '/admin/blog/new' },
]

export default function AdminCommandPalette({ onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k'
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    navigate(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Admin Command Palette"
      description="Jump to any admin section or run a quick action"
    >
      <CommandInput placeholder="Search sections, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Go to">
          {navCommands.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          {actionCommands.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon />
              <span>{item.label}</span>
            </CommandItem>
          ))}
          <CommandItem
            onSelect={() => {
              setOpen(false)
              onSignOut()
            }}
          >
            <LogOut />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex items-center justify-end gap-1 border-t px-3 py-2 text-xs text-muted-foreground">
        Press <CommandShortcut className="static ml-0">Esc</CommandShortcut> to close
      </div>
    </CommandDialog>
  )
}
