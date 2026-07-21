import { useEffect, useState } from 'react'
import LegalPageLayout, { type LegalSection } from '@/components/legal/LegalPageLayout'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_SITE_SETTINGS } from '@/lib/content/defaults'
import type { SiteSettingsContent } from '@/lib/content/defaults'

const EFFECTIVE_DATE = 'July 19, 2026'
// No CMS field exists yet for these — fill in directly here, or wire them
// into Site Settings in the admin CMS if you want them editable later.
const GOVERNING_LAW = '[State/Country of Governing Law — e.g. Haryana, India]'

export default function TermsOfUse() {
  const [settings, setSettings] = useState<SiteSettingsContent>(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteContent('site_settings').then(setSettings).catch(console.error)
  }, [])

  const siteName = settings.site_name
  const email = settings.contact_email
  const siteHost = typeof window !== 'undefined' ? window.location.hostname : 'this website'

  const sections: LegalSection[] = [
    {
      heading: '1. Acceptance of These Terms',
      paragraphs: [
        `These Terms of Use ("Terms") govern your access to and use of ${siteHost} (the "Site"), operated by ${siteName} ("we," "us," or "our"). By browsing, submitting a form, or otherwise using the Site, you agree to be bound by these Terms. If you do not agree, please do not use the Site.`,
      ],
    },
    {
      heading: '2. About This Site',
      paragraphs: [
        'The Site is a personal and professional portfolio showcasing our work, skills, and freelance web development services, and includes pages for viewing project work, viewing pricing, requesting a consultation, and contacting us.',
        'These Terms cover use of the Site itself. If we agree to provide you with paid web development or related services, that engagement is additionally governed by our separate Terms and Conditions of Service, which take precedence for matters relating to a specific project.',
      ],
    },
    {
      heading: '3. Eligibility',
      paragraphs: [
        'You must be at least 18 years old, or the age of legal majority in your jurisdiction, to submit a form or engage our services through this Site. By using the Site, you represent that you meet this requirement.',
      ],
    },
    {
      heading: '4. Acceptable Use',
      paragraphs: ['You agree not to:'],
      bullets: [
        'Use the Site for any unlawful purpose or in violation of any applicable law.',
        'Attempt to gain unauthorized access to any part of the Site, including the admin dashboard, source code, or database.',
        'Scrape, crawl, or harvest data from the Site using automated means without our written consent.',
        'Upload or transmit viruses, malware, or any code intended to disrupt the Site\u2019s functionality.',
        'Impersonate any person or entity, or submit false or misleading information through our contact or booking forms.',
        'Interfere with the security, integrity, or performance of the Site.',
      ],
    },
    {
      heading: '5. Contact and Booking Submissions',
      paragraphs: [
        'When you submit the contact form or request a booking through the Site, you agree to provide accurate, current, and complete information. Submitting a booking request does not, by itself, create a binding service agreement — an engagement begins only once both parties confirm scope, pricing, and timeline in writing (for example, by email or signed proposal).',
      ],
    },
    {
      heading: '6. Intellectual Property',
      paragraphs: [
        `Unless otherwise noted, all content on the Site — including its design, layout, source code, graphics, text, logos, and the portfolio work displayed on it — is owned by ${siteName} or used with permission, and is protected by applicable copyright, trademark, and other intellectual property laws.`,
        'You may view and share pages of the Site for personal, non-commercial reference. You may not copy, reproduce, republish, or create derivative works from the Site\u2019s design or code without our prior written consent.',
        'Client project work shown in the portfolio remains subject to any confidentiality or usage restrictions agreed with the relevant client.',
      ],
    },
    {
      heading: '7. Third-Party Links and Services',
      paragraphs: [
        'The Site may link to third-party websites (for example, social media profiles) that we do not control. We are not responsible for the content, privacy practices, or terms of any third-party site, and inclusion of a link does not imply endorsement.',
      ],
    },
    {
      heading: '8. Disclaimer of Warranties',
      paragraphs: [
        'The Site is provided "as is" and "as available," without warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or that the Site will be uninterrupted, secure, or error-free.',
      ],
    },
    {
      heading: '9. Limitation of Liability',
      paragraphs: [
        `To the fullest extent permitted by law, ${siteName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, revenue, or profits, arising out of or relating to your use of, or inability to use, the Site.`,
      ],
    },
    {
      heading: '10. Indemnification',
      paragraphs: [
        `You agree to indemnify and hold harmless ${siteName} from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your violation of these Terms or your misuse of the Site.`,
      ],
    },
    {
      heading: '11. Changes to These Terms',
      paragraphs: [
        'We may update these Terms from time to time. The "Effective Date" above reflects the last revision. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.',
      ],
    },
    {
      heading: '12. Governing Law and Dispute Resolution',
      paragraphs: [
        `These Terms are governed by the laws of ${GOVERNING_LAW}, without regard to conflict-of-law principles. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the competent courts located in ${GOVERNING_LAW}.`,
      ],
    },
    {
      heading: '13. Severability',
      paragraphs: [
        'If any provision of these Terms is found unenforceable, the remaining provisions will continue in full force and effect.',
      ],
    },
    {
      heading: '14. Contact Us',
      paragraphs: [`Questions about these Terms can be sent to ${email}.`],
    },
  ]

  return (
    <LegalPageLayout title="Terms of Use" effectiveDate={EFFECTIVE_DATE} sections={sections} />
  )
}
