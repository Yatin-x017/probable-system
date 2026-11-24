import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_SITE_SETTINGS } from '@/lib/content/defaults'
import type { SiteSettingsContent } from '@/lib/content/defaults'
import YatsLogo from '@/components/YatsLogo'

const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettingsContent>(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteContent('site_settings').then(setSettings).catch(console.error)
  }, [])

  const socialLinks = [
    { icon: Github, href: settings.social_github, label: 'GitHub' },
    { icon: Linkedin, href: settings.social_linkedin, label: 'LinkedIn' },
    { icon: Mail, href: `mailto:${settings.contact_email}`, label: 'Email' },
  ]

  return (
    <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="bg-[#182338] text-[#f6f1e8]">
      <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="grid gap-12 border-b border-white/20 pb-12 md:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <div>
            <Link to="/" aria-label="Yats home" className="inline-flex items-center gap-2.5">
              <YatsLogo light compact />
              <span className="font-display text-2xl font-extrabold tracking-[-0.075em]">yats<span className="text-[#f05b43]">.</span></span>
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-[#f6f1e8]/70">{settings.footer_tagline}</p>
          </div>

          <div>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.12em] text-[#efc65f]">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}><Link to={link.href} className="text-sm text-[#f6f1e8]/78 transition-colors hover:text-white">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.12em] text-[#efc65f]">Say hello</h2>
            <a href={`mailto:${settings.contact_email}`} className="mt-4 inline-flex items-center gap-2 text-sm text-white underline decoration-[#f05b43] underline-offset-4 hover:text-[#efc65f]">
              {settings.contact_email}<ArrowUpRight className="h-4 w-4" />
            </a>
            <div className="mt-6 flex gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target={label === 'Email' ? undefined : '_blank'} rel={label === 'Email' ? undefined : 'noopener noreferrer'} aria-label={label} className="inline-flex h-10 w-10 items-center justify-center border border-white/25 text-white/80 transition-colors hover:border-[#efc65f] hover:bg-[#efc65f] hover:text-[#182338]">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-5 text-xs text-[#f6f1e8]/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Yats · made by Yatin Sharma</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/cookies" className="hover:text-white">Cookies</Link>
            <Link to="/admin/login" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
