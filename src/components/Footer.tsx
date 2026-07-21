import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Github, Linkedin, Mail } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_SITE_SETTINGS } from '@/lib/content/defaults'
import { pressable, springs, useStagger } from '@/lib/motion'
import { useLenis } from '@/components/ScrollProvider'
import type { SiteSettingsContent } from '@/lib/content/defaults'

// How far the page needs to scroll before the footer is allowed to reveal.
// Small enough to feel responsive, large enough that landing on a short page
// (like Book) doesn't dump the footer straight into view unscrolled.
const REVEAL_THRESHOLD = 48

const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book a Call', href: '/book' },
]

const legalLinks = [
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms-of-service' },
  { label: 'Data Policy', href: '/data-policy' },
  { label: 'Cookie Preferences', href: '/cookies' },
]

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettingsContent>(DEFAULT_SITE_SETTINGS)
  const stagger = useStagger()
  const lenis = useLenis()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    getSiteContent('site_settings').then(setSettings).catch(console.error)
  }, [])

  // Footer starts hidden on every route and only reveals once the person has
  // scrolled a bit — so it never just sits fully in view on a short page
  // (like Book) before they've done anything.
  useEffect(() => {
    setRevealed(false)

    const checkScroll = (scroll: number) => {
      if (scroll > REVEAL_THRESHOLD) setRevealed(true)
    }

    if (lenis) {
      const handler = ({ scroll }: { scroll: number }) => checkScroll(scroll)
      lenis.on('scroll', handler)
      checkScroll(lenis.scroll ?? window.scrollY)
      return () => {
        lenis.off('scroll', handler)
      }
    }

    const handleWindowScroll = () => checkScroll(window.scrollY)
    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    handleWindowScroll()
    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [lenis, location.pathname])

  const socialLinks = [
    { icon: Github, href: settings.social_github, label: 'GitHub' },
    { icon: Linkedin, href: settings.social_linkedin, label: 'LinkedIn' },
    { icon: Mail, href: `mailto:${settings.contact_email}`, label: 'Email' },
  ]

  return (
    <motion.footer
      initial={false}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
      transition={prefersReducedMotion ? { duration: 0.15 } : springs.smooth}
      style={{ pointerEvents: revealed ? 'auto' : 'none' }}
      className="border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Brand */}
          <motion.div variants={stagger.item}>
            <Link to="/" className="text-lg font-semibold text-gray-900">
              {settings.site_name}
            </Link>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              {settings.footer_tagline}
            </p>
          </motion.div>

          {/* Links */}
          <motion.div variants={stagger.item}>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="mt-3 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div variants={stagger.item}>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Connect
            </h3>
            <div className="mt-3 flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...pressable}
                  transition={springs.press}
                  className="p-2 rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {settings.site_name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
