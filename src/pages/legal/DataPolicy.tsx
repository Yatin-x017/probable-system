import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LegalPageLayout, { type LegalSection } from '@/components/legal/LegalPageLayout'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_SITE_SETTINGS } from '@/lib/content/defaults'
import type { SiteSettingsContent } from '@/lib/content/defaults'

const EFFECTIVE_DATE = 'July 19, 2026'

export default function DataPolicy() {
  const [settings, setSettings] = useState<SiteSettingsContent>(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteContent('site_settings').then(setSettings).catch(console.error)
  }, [])

  const siteName = settings.site_name
  const email = settings.contact_email

  const sections: LegalSection[] = [
    {
      heading: '1. How This Relates to Our Privacy Policy',
      paragraphs: [
        `This Data Policy is a more technical companion to ${siteName}'s Privacy Policy. Where the Privacy Policy explains what we collect and why in plain terms, this page sets out exactly which data categories exist, where each one is stored, how long we keep it, and who processes it on our behalf. If anything here appears to conflict with the Privacy Policy, the Privacy Policy governs, and we'd appreciate you letting us know at ${email} so we can fix the inconsistency.`,
      ],
    },
    {
      heading: '2. Data Categories We Handle',
      table: {
        headers: ['Category', 'What it includes', 'Collected via'],
        rows: [
          ['Contact submissions', 'Name, email address, message content', 'Contact form'],
          [
            'Booking submissions',
            'Name, email address, project details, selected date/time',
            'Booking form',
          ],
          [
            'Site preference data',
            'Cookie-consent choice, onboarding tour status',
            'Functional cookies',
          ],
          [
            'Aggregate usage data',
            'Page views, referrers, approximate location, device/browser type — not tied to an individual identity',
            'Vercel Analytics',
          ],
        ],
      },
    },
    {
      heading: '3. Cookies We Use',
      paragraphs: [
        'We keep cookie use deliberately minimal. Here is every cookie the Site sets:',
      ],
      table: {
        headers: ['Cookie', 'Purpose', 'Type', 'Duration'],
        rows: [
          [
            'cookie_consent',
            'Remembers your response to the cookie banner',
            'Strictly necessary',
            '365 days',
          ],
          [
            'site_tour_status',
            'Remembers whether you\u2019ve completed or skipped the onboarding site tour',
            'Functional',
            '365 days',
          ],
        ],
      },
      bullets: [
        'Vercel Analytics does not set a cookie for the aggregate traffic data described above.',
        'We do not use third-party advertising or cross-site tracking cookies.',
      ],
    },
    {
      heading: '4. Where Data Is Stored',
      bullets: [
        'Contact and booking submissions are stored in our Supabase-hosted database (PostgreSQL), access-controlled by row-level security policies limiting reads to authenticated admin accounts.',
        'Static site assets and Vercel Analytics data are hosted on Vercel\u2019s infrastructure.',
        'Cookie data described above is stored only in your own browser, not on our servers.',
      ],
    },
    {
      heading: '5. Data Retention Schedule',
      table: {
        headers: ['Data category', 'Retention period'],
        rows: [
          ['Contact form submissions', 'Until resolved, then deleted or anonymized within [X] months'],
          ['Booking submissions', 'For the duration of the engagement, then per our accounting retention needs (typically up to [X] years)'],
          ['Cookie preference / tour status', 'Up to 365 days, or until you clear your browser cookies'],
          ['Aggregate analytics data', 'Per Vercel\u2019s standard analytics retention window'],
        ],
      },
    },
    {
      heading: '6. Subprocessors',
      paragraphs: ['We use the following subprocessors to operate the Site and deliver our services:'],
      table: {
        headers: ['Subprocessor', 'Purpose', 'Location'],
        rows: [
          ['Supabase', 'Database hosting, authentication, storage', '[Supabase project region]'],
          ['Vercel', 'Site hosting, deployment, aggregate analytics', '[Vercel deployment region]'],
        ],
      },
    },
    {
      heading: '7. Security Measures',
      bullets: [
        'Admin access to stored form and booking data requires authenticated login, separate from the public Site.',
        'Database access is restricted through row-level security policies rather than open API access.',
        'We do not store payment card details on the Site; any payment records kept in the admin dashboard are entered manually and are for internal bookkeeping only.',
      ],
    },
    {
      heading: '8. Data Breach Notification',
      paragraphs: [
        'If we become aware of a security incident that compromises your personal information, we will take reasonable steps to investigate and, where required by applicable law, notify affected individuals and any relevant authority without undue delay.',
      ],
    },
    {
      heading: '9. Your Choices and Controls',
      paragraphs: [
        'You can review or change your cookie preference at any time on our Cookie Preferences page, or request access, correction, or deletion of your data as described in our Privacy Policy.',
      ],
    },
    {
      heading: '10. Contact Us',
      paragraphs: [`Questions about how we handle data can be sent to ${email}.`],
    },
  ]

  return (
    <LegalPageLayout title="Data Policy" effectiveDate={EFFECTIVE_DATE} sections={sections}>
      <p className="text-sm text-gray-500">
        Looking for cookie controls specifically? Visit{' '}
        <Link to="/cookies" className="text-gray-900 underline underline-offset-2">
          Cookie Preferences
        </Link>
        . For the plain-language overview, see our{' '}
        <Link to="/privacy" className="text-gray-900 underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPageLayout>
  )
}
