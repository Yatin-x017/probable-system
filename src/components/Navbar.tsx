import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_SITE_SETTINGS } from '@/lib/content/defaults'
import { Button } from '@/components/ui/button'
import { springs } from '@/lib/motion'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [siteName, setSiteName] = useState(DEFAULT_SITE_SETTINGS.site_name)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    getSiteContent('site_settings')
      .then((s) => setSiteName(s.site_name))
      .catch(console.error)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const isActive = (href: string) => {
    if (href === '/work') return location.pathname.startsWith('/work')
    if (href === '/blog') return location.pathname.startsWith('/blog')
    return location.pathname === href
  }

  return (
    <>
      {/* Floating glass navbar. Shrinks + gains blur/border once you scroll
          past the hero, so it reads as a real surface instead of a static bar. */}
      <motion.nav
        initial={false}
        animate={{
          paddingTop: scrolled ? 10 : 20,
          paddingBottom: scrolled ? 10 : 20,
        }}
        transition={springs.smooth}
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6"
      >
        <motion.div
          initial={false}
          animate={{
            backgroundColor: scrolled ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0)',
            borderColor: scrolled ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0)',
            boxShadow: scrolled
              ? '0 8px 30px -12px rgb(0 0 0 / 0.12)'
              : '0 0px 0px 0 rgb(0 0 0 / 0)',
          }}
          transition={springs.smooth}
          // backdrop-blur is only mounted once there's an actual white surface
          // to blur (i.e. once scrolled). Leaving it on permanently — even at
          // 0% background opacity — was sampling the WebGL hero underneath
          // and rendering as a hazy, blocky smear instead of a clean pane of
          // glass, which killed the premium feel of the header.
          className={cn(
            'mx-auto max-w-6xl rounded-2xl border',
            scrolled && 'backdrop-blur-xl'
          )}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 h-12">
            {/* Logo */}
            <Link
              to="/"
              className="text-base font-semibold tracking-tight text-gray-900 transition-opacity hover:opacity-70"
            >
              {siteName}
            </Link>

            {/* Desktop Nav — active link gets a sliding pill via layoutId */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  data-tour={`nav-${link.label.toLowerCase()}`}
                  className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-gray-100"
                      transition={springs.snappy}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
              <Button asChild size="sm" className="ml-2 rounded-full">
                <Link to="/book" data-tour="nav-book">Book a Call</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 -mr-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={springs.snappy}
                  className="flex"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={springs.smooth}
              className="absolute top-20 left-3 right-3 rounded-2xl bg-white/95 backdrop-blur-xl shadow-layer-lg border border-black/5 overflow-hidden"
            >
              <div className="px-3 py-3 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...springs.smooth, delay: i * 0.04 }}
                  >
                    <Link
                      to={link.href}
                      className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <Button asChild className="w-full mt-2 rounded-xl">
                  <Link to="/book">Book a Call</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
