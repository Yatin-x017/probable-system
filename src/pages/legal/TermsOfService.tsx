import { useEffect, useState } from 'react'
import LegalPageLayout, { type LegalSection } from '@/components/legal/LegalPageLayout'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_SITE_SETTINGS } from '@/lib/content/defaults'
import type { SiteSettingsContent } from '@/lib/content/defaults'

const EFFECTIVE_DATE = 'July 19, 2026'
const GOVERNING_LAW = '[State/Country of Governing Law — e.g. Haryana, India]'

export default function TermsOfService() {
  const [settings, setSettings] = useState<SiteSettingsContent>(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    getSiteContent('site_settings').then(setSettings).catch(console.error)
  }, [])

  const siteName = settings.site_name
  const email = settings.contact_email
  const siteHost = typeof window !== 'undefined' ? window.location.hostname : 'this website'

  const sections: LegalSection[] = [
    {
      heading: '1. Introduction and Scope',
      paragraphs: [
        `These Terms and Conditions ("Agreement") govern the provision of freelance web development and related digital services (the "Services") by ${siteName} ("Developer," "we," "us") to any individual or business ("Client," "you") who engages us through ${siteHost} or otherwise. This Agreement applies once a Client confirms a proposal, quote, or booking; it supplements, and does not replace, any signed project-specific Statement of Work ("SOW"), which will control in the event of a conflict.`,
      ],
    },
    {
      heading: '2. Proposals, Quotes, and Project Scope',
      paragraphs: [
        'Before any work begins, we will provide a written proposal or quote outlining the scope of work, estimated timeline, and fees. Work outside this agreed scope ("Out-of-Scope Work") will require a separate quote and, where relevant, an updated timeline.',
      ],
    },
    {
      heading: '3. Booking a Consultation',
      paragraphs: [
        'The Site\u2019s booking feature lets you request a consultation slot. A confirmed booking reserves time for an initial discussion; it does not, by itself, constitute acceptance of a project or create payment obligations beyond any consultation fee explicitly disclosed at booking.',
      ],
    },
    {
      heading: '4. Fees and Payment Terms',
      paragraphs: [
        'Fees are quoted in USD or INR depending on the Client\u2019s region, as shown on our Pricing page or in the project proposal. Unless otherwise agreed in writing:',
      ],
      bullets: [
        'A non-refundable deposit of [X]% of the total project fee is due before work begins.',
        'Remaining fees are payable according to the milestones set out in the proposal or SOW (for example, at project midpoint and upon completion).',
        'Invoices are due within [X] days of issue. Late payments may accrue a late fee of [X]% per month and may result in a pause of work until payment is received.',
        'All fees are exclusive of applicable taxes, which are the Client\u2019s responsibility unless stated otherwise.',
      ],
    },
    {
      heading: '5. Revisions and Change Requests',
      paragraphs: [
        'Each project includes the number of revision rounds specified in the proposal. Additional revisions or scope changes beyond that will be quoted separately and may affect the delivery timeline.',
      ],
    },
    {
      heading: '6. Client Responsibilities',
      paragraphs: ['To keep the project on schedule, the Client agrees to:'],
      bullets: [
        'Provide timely feedback, content, images, and other materials needed for the project.',
        'Provide any necessary access credentials (e.g., domain, hosting, third-party accounts) in a timely and secure manner.',
        'Respond to requests for approval or clarification within a reasonable time; delays caused by the Client may extend the delivery timeline accordingly.',
        'Ensure any content, branding, or assets supplied to us do not infringe third-party rights.',
      ],
    },
    {
      heading: '7. Timelines and Delays',
      paragraphs: [
        'Timelines provided in a proposal are estimates based on timely Client cooperation and are not guaranteed delivery dates unless expressly agreed in writing. We are not liable for delays caused by Client feedback delays, third-party service outages, or force majeure events described in Section 14.',
      ],
    },
    {
      heading: '8. Intellectual Property and Ownership',
      paragraphs: [
        'Upon receipt of full and final payment for a project, ownership of the final deliverables (custom code, designs, and content created specifically for that Client) transfers to the Client, except for:',
      ],
      bullets: [
        'Any pre-existing tools, templates, frameworks, snippets, or components we owned or licensed prior to the engagement, which remain our property and are licensed to the Client for use within the delivered project.',
        'Third-party assets, plugins, stock media, or fonts, which remain subject to their original licenses.',
      ],
    },
    {
      heading: '8a. Portfolio Rights',
      paragraphs: [
        'We retain the right to display general, non-confidential descriptions and visuals of completed projects in our portfolio (including on this Site) for self-promotion, unless the Client requests confidentiality in writing under Section 9.',
      ],
    },
    {
      heading: '9. Confidentiality',
      paragraphs: [
        'Each party agrees to keep confidential any non-public business, technical, or financial information disclosed by the other party during the engagement, and to use it only for purposes of completing the project, except where disclosure is required by law.',
      ],
    },
    {
      heading: '10. Warranties and Disclaimers',
      paragraphs: [
        'We will perform the Services in a professional and workmanlike manner consistent with industry standards. Except as expressly stated, Services and deliverables are provided "as is," and we make no other warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, or that the deliverables will be free of every error or compatible with every future third-party update.',
      ],
    },
    {
      heading: '11. Limitation of Liability',
      paragraphs: [
        'To the fullest extent permitted by law, our total liability arising out of or relating to any project shall not exceed the total fees paid by the Client for that project. Neither party shall be liable for indirect, incidental, or consequential damages, including loss of profits or data, arising from this Agreement.',
      ],
    },
    {
      heading: '12. Cancellation and Refund Policy',
      paragraphs: ['Either party may cancel a project with written notice. In the event of cancellation:'],
      bullets: [
        'Deposits already paid are non-refundable, as they compensate for time and slots reserved.',
        'The Client will be invoiced for all work completed up to the date of cancellation, calculated on a pro-rata or milestone basis.',
        'Any amounts paid in excess of work completed will be refunded within [X] business days.',
      ],
    },
    {
      heading: '13. Termination',
      paragraphs: [
        'We may pause or terminate a project if the Client fails to pay invoiced amounts, fails to provide necessary cooperation for an extended period (e.g., [X] days), or engages in abusive conduct toward us. Upon termination, Section 12 (Cancellation and Refunds) applies.',
      ],
    },
    {
      heading: '14. Force Majeure',
      paragraphs: [
        'Neither party is liable for delays or failures in performance resulting from events beyond their reasonable control, including natural disasters, internet or power outages, third-party platform outages, or governmental action.',
      ],
    },
    {
      heading: '15. Independent Contractor Relationship',
      paragraphs: [
        'We provide Services as an independent contractor, not as an employee, agent, or partner of the Client. Nothing in this Agreement creates a partnership, joint venture, or employment relationship between the parties.',
      ],
    },
    {
      heading: '16. Governing Law and Dispute Resolution',
      paragraphs: [
        `This Agreement is governed by the laws of ${GOVERNING_LAW}. The parties will first attempt to resolve any dispute informally; if unresolved within [X] days, the dispute shall be subject to the exclusive jurisdiction of the competent courts located in ${GOVERNING_LAW}.`,
      ],
    },
    {
      heading: '17. Entire Agreement and Amendments',
      paragraphs: [
        'This Agreement, together with any project-specific proposal or SOW, constitutes the entire understanding between the parties regarding the Services and supersedes any prior discussions. Amendments must be made in writing and agreed by both parties.',
      ],
    },
    {
      heading: '18. Contact Us',
      paragraphs: [`Questions about this Agreement can be sent to ${email}.`],
    },
  ]

  return (
    <LegalPageLayout
      title="Terms and Conditions of Service"
      effectiveDate={EFFECTIVE_DATE}
      sections={sections}
    />
  )
}
