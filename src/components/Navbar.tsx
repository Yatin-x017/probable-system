import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import YatsLogo from '@/components/YatsLogo'

const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/pricing' },
  { label: 'About', href: '/about' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setMobileOpen(false), [location.pathname])

  const isActive = (href: string) => href === '/work'
    ? location.pathname.startsWith('/work')
    : location.pathname === href

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#f6f1e8] text-[#182338]">
      <nav aria-label="Main navigation" className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between border-b border-[#182338]/15 px-5 sm:px-8 lg:px-12">
        <Link to="/" aria-label="Yats home" className="inline-flex items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#426fbd]">
          <YatsLogo compact animated />
          <span className="ml-2.5 font-display text-[1.42rem] font-extrabold tracking-[-0.075em]">yats<span className="text-[#f05b43]">.</span></span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative py-2 text-[13px] font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:origin-left after:bg-[#f05b43] after:transition-transform after:duration-300 ${isActive(link.href) ? 'text-[#182338] after:scale-x-100' : 'text-[#5d6673] after:scale-x-0 hover:text-[#182338] hover:after:scale-x-100'}`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/contact" className="group inline-flex h-10 items-center gap-2 bg-[#182338] px-4 text-[13px] font-semibold text-[#f6f1e8] transition-colors hover:bg-[#f05b43] hover:text-[#182338]">
            Start a project
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center border border-[#182338]/20 text-[#182338] transition-colors hover:bg-[#efc65f] md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={mobileOpen ? 'close' : 'open'} initial={{ opacity: 0, rotate: -25 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 25 }} transition={{ duration: 0.15 }}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-[76px] border-b border-[#182338]/15 bg-[#f6f1e8] px-5 pb-6 pt-3 shadow-[0_18px_36px_rgba(24,35,56,0.12)] md:hidden"
          >
            <div className="mx-auto max-w-[1440px]">
              {navLinks.map((link, index) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}>
                  <Link to={link.href} className="flex min-h-14 items-center justify-between border-b border-[#182338]/10 font-display text-xl font-bold tracking-[-0.04em]">
                    {link.label}<ArrowUpRight className="h-4 w-4 text-[#f05b43]" />
                  </Link>
                </motion.div>
              ))}
              <Link to="/contact" className="mt-5 flex h-12 items-center justify-center gap-2 bg-[#182338] text-sm font-semibold text-[#f6f1e8]">
                Start a project<ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
