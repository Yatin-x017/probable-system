import { useEffect, useState } from 'react'
import LegalPageLayout, { type LegalSection } from '@/components/legal/LegalPageLayout'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_SITE_SETTINGS } from '@/lib/content/defaults'
import type { SiteSettingsContent } from '@/lib/content/defaults'

const EFFECTIVE_DATE = 'July 19, 2026'
const ADDRESS = '[City, State, Country]'

export default function PrivacyPolicy() {
  const [settings, setSettings] = useState<SiteSettingsContent>(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteContent('site_settings').then(setSettings).catch(console.error)
  }, [])

  const siteName = settings.site_name
  const email = settings.contact_email
  const siteHost = typeof window !== 'undefined' ? window.location.hostname : 'this website'

  const sections: LegalSection[] = [
    {
      heading: '1. Introduction',
      paragraphs: [
        `This Privacy Policy explains how ${siteName} ("we," "us," or "our") collects, uses, discloses, and protects information when you visit ${siteHost} (the "Site"), submit our contact form, or request a booking or consultation.`,
      ],
    },
    {
      heading: '2. Information We Collect',
      paragraphs: ['Information you provide directly:'],
      bullets: [
        'Contact form: your name, email address, and the content of your message.',
        'Booking / consultation requests: your name, email address, project details or requirements, and your selected date/time.',
        'Any other information you choose to share with us by email or during a consultation.',
      ],
    },
    {
      heading: '2a. Information Collected Automatically',
      bullets: [
        'We use Vercel Analytics to understand aggregate Site traffic — such as page views, referring pages, general device/browser type, and approximate (city/country-level) location. This analytics service is designed to avoid tracking individual visitors across sites and does not use tracking cookies for this purpose.',
        'We use a small number of functional cookies — for example, to remember whether you\u2019ve completed or dismissed the onboarding site tour, and to record your cookie consent preference. These cookies do not track you across other websites.',
      ],
    },
    {
      heading: '3. How We Use Your Information',
      paragraphs: ['We use the information described above to:'],
      bullets: [
        'Respond to your inquiries and manage booking requests.',
        'Prepare proposals, quotes, and invoices for services you request.',
        'Operate, maintain, and improve the Site, including understanding how visitors use it.',
        'Remember your cookie and onboarding preferences.',
        'Comply with legal obligations and enforce our Terms of Use and Terms and Conditions.',
      ],
    },
    {
      heading: '4. Legal Basis for Processing',
      paragraphs: [
        'Where applicable data protection law requires a legal basis (for example, under the GDPR), we rely on: your consent (for optional cookies), our legitimate interest in operating and improving the Site and responding to inquiries, and the performance of a contract when you engage us for services.',
      ],
    },
    {
      heading: '5. How We Share Your Information',
      paragraphs: ['We do not sell your personal information. We share information only with:'],
      bullets: [
        'Supabase, our database and backend hosting provider, which stores form submissions and booking data on our behalf.',
        'Vercel, our hosting provider, which also provides the aggregate analytics described above.',
        'Professional advisors (such as accountants) where reasonably necessary to run our freelance business.',
        'Authorities, where required to comply with a legal obligation, court order, or to protect our legal rights.',
      ],
    },
    {
      heading: '6. Data Retention',
      paragraphs: [
        'We retain contact and booking submissions for as long as reasonably necessary to respond to your inquiry, deliver any services you\u2019ve engaged us for, and comply with legal, accounting, or reporting obligations, after which we delete or anonymize it.',
      ],
    },
    {
      heading: '7. Data Security',
      paragraphs: [
        'We use reasonable technical and organizational measures — including access-restricted admin credentials and database-level access policies — to protect your information. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      heading: '8. Your Rights',
      paragraphs: ['Depending on your location, you may have the right to:'],
      bullets: [
        'Request access to, or a copy of, the personal information we hold about you.',
        'Request correction of inaccurate information.',
        'Request deletion of your information, subject to any legal retention requirements.',
        'Withdraw cookie consent at any time via your browser settings or our cookie banner.',
        'Object to certain uses of your information.',
      ],
    },
    {
      heading: '9. Children\u2019s Privacy',
      paragraphs: [
        'The Site is not directed to individuals under 18, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.',
      ],
    },
    {
      heading: '10. International Data Transfers',
      paragraphs: [
        'Our hosting and analytics providers may process and store information on servers located outside your home country. By using the Site, you understand your information may be transferred to and processed in such locations, consistent with this Policy.',
      ],
    },
    {
      heading: '11. Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy periodically. Material changes will be reflected by updating the "Effective Date" above. We encourage you to review this page from time to time.',
      ],
    },
    {
      heading: '12. Contact Us',
      paragraphs: [`For any privacy-related questions or requests, please contact us at ${email} or ${ADDRESS}.`],
    },
  ]

  return (
    <LegalPageLayout title="Privacy Policy" effectiveDate={EFFECTIVE_DATE} sections={sections} />
  )
}
