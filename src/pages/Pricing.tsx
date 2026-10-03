import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRevealUp, useStagger, springs } from '@/lib/motion'
import { useVisitorRegion } from '@/hooks/useVisitorRegion'
import ProjectFinder from '@/components/pricing/ProjectFinder'

type BillingCycle = 'project' | 'retainer'

interface Tier {
  id: string
  name: string
  tagline: string
  price: { project: number | null; retainer: number | null }
  featured?: boolean
  features: string[]
  cta: string
}

// Pricing is always shown in USD — flat rates for what this scope of work
// is worth in the US freelance market, regardless of where a visitor is
// browsing from.
const TIERS: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'A focused site for a single location or service.',
    price: { project: 900, retainer: 150 },
    features: [
      'Up to 5 pages',
      'Responsive design, built on your brand',
      'Contact form + WhatsApp click-to-chat',
      'Basic on-page SEO',
      '2 rounds of revisions',
    ],
    cta: 'Start with Starter',
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'The one most small businesses actually need.',
    price: { project: 1600, retainer: 250 },
    featured: true,
    features: [
      'Everything in Starter',
      'Up to 12 pages, incl. blog/menu/gallery',
      'Booking or ordering flow (like this site\u2019s /book)',
      'Admin dashboard to edit content yourself',
      'Analytics dashboard + monthly report',
      'Priority support, 3 rounds of revisions',
    ],
    cta: 'Start with Growth',
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Custom product work — for teams outgrowing a template.',
    price: { project: null, retainer: null },
    features: [
      'Everything in Growth',
      'Custom features & integrations (payments, CRM, etc.)',
      'Multi-admin roles & permissions',
      'Dedicated Slack/WhatsApp channel',
      'Ongoing feature roadmap, not just fixes',
    ],
    cta: 'Book a call to scope it',
  },
]

const FAQS = [
  {
    q: 'What\u2019s the difference between project and retainer pricing?',
    a: 'Project pricing is a one-time build fee for a site you own outright. Retainer pricing spreads that cost monthly and includes ongoing edits, small features, and support — no separate invoice every time you need a text change.',
  },
  {
    q: 'Do you charge in other currencies?',
    a: 'All pricing is in USD, at flat US-market rates — not a currency conversion, so it stays consistent no matter where you\u2019re based.',
  },
  {
    q: 'How long does a typical build take?',
    a: 'Starter sites usually ship in 1–2 weeks. Growth sites with a booking or ordering flow take 3–4 weeks. Scale projects are scoped individually on the intro call.',
  },
  {
    q: 'Do I own the code and content?',
    a: 'Yes. Everything is handed over — source code, Supabase project, and content — with no lock-in to keep working together.',
  },
]

function formatPrice(amount: number | null): string {
  if (amount === null) return 'Custom quote'
  return `$${amount.toLocaleString('en-US')}`
}

export default function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>('project')
  const [recommendedTier, setRecommendedTier] = useState<string | null>(null)
  const region = useVisitorRegion()
  const revealUp = useRevealUp()
  const stagger = useStagger()

  return (
    <div className="pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...revealUp} className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">
            Pricing
          </p>
          <h1 className="text-display-md text-gray-900">
            Straightforward pricing, built for small businesses.
          </h1>
          <p className="mt-4 text-gray-500">
            No hidden fees, no bloated retainers. Pick what fits where your
            business is today — every tier includes the same senior-level
            build quality.
          </p>
        </motion.div>

        <ProjectFinder onRecommend={setRecommendedTier} />

        {/* Toggles: billing cycle + currency */}
        <motion.div {...revealUp} className="flex flex-col items-center gap-4 mb-14">
          <div className="inline-flex items-center rounded-full bg-gray-50 ring-1 ring-gray-200 p-1">
            {(['project', 'retainer'] as BillingCycle[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCycle(option)}
                className="relative px-5 py-2 text-sm font-medium rounded-full transition-colors"
              >
                {cycle === option && (
                  <motion.span
                    layoutId="pricing-toggle-pill"
                    className="absolute inset-0 bg-gray-900 rounded-full"
                    transition={springs.smooth}
                  />
                )}
                <span className={cn('relative z-10', cycle === option ? 'text-white' : 'text-gray-600')}>
                  {option === 'project' ? 'One-time project' : 'Monthly retainer'}
                </span>
              </button>
            ))}
          </div>

          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
            All prices in USD
            {region.countryCode && region.countryCode !== 'US' && (
              <span>— serving clients worldwide, {region.countryName ?? 'wherever you are'} included</span>
            )}
          </p>
        </motion.div>

        {/* Tiers */}
        <motion.div
          id="tiers"
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
        >
          {TIERS.map((tier) => {
            const amount = tier.price[cycle]
            const isRecommended = recommendedTier === tier.id
            return (
              <motion.div
                key={tier.id}
                variants={stagger.item}
                whileHover={{ y: -4 }}
                transition={springs.smooth}
                className={cn(
                  'relative flex flex-col rounded-2xl p-8 h-full transition-shadow',
                  tier.featured
                    ? 'bg-gray-900 text-white shadow-xl md:-translate-y-3'
                    : 'bg-gray-50 text-gray-900 ring-1 ring-gray-200',
                  isRecommended && !tier.featured && 'ring-2 ring-gray-900',
                  isRecommended && 'shadow-xl'
                )}
              >
                {tier.featured && !isRecommended && (
                  <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-sky px-3 py-1 text-[11px] font-semibold text-white">
                    <Sparkles className="w-3 h-3" />
                    Most popular
                  </span>
                )}
                {isRecommended && (
                  <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-fresh px-3 py-1 text-[11px] font-semibold text-white">
                    <Check className="w-3 h-3" />
                    Recommended for you
                  </span>
                )}

                <h2 className="text-lg font-semibold">{tier.name}</h2>
                <p className={cn('mt-1 text-sm', tier.featured ? 'text-gray-300' : 'text-gray-500')}>
                  {tier.tagline}
                </p>

                <div className="mt-6 mb-2">
                  <span className="text-3xl font-bold tracking-tight">
                    {formatPrice(amount)}
                  </span>
                  {amount !== null && (
                    <span className="ml-1.5 text-sm text-gray-400">
                      {cycle === 'project' ? 'one-time' : 'billed monthly'}
                    </span>
                  )}
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check
                        className={cn('w-4 h-4 mt-0.5 shrink-0', tier.featured ? 'text-fresh' : 'text-fresh-600')}
                      />
                      <span className={tier.featured ? 'text-gray-200' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    'w-full mt-8',
                    tier.featured
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  )}
                >
                  <Link to="/book">{tier.cta}</Link>
                </Button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* FAQ */}
        <motion.div {...revealUp} className="max-w-2xl mx-auto mt-28">
          <h2 className="text-display-sm text-gray-900 text-center mb-10">
            Common questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((item) => (
              <div key={item.q} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div {...revealUp} className="text-center mt-20">
          <p className="text-gray-500 mb-4">Not sure which tier fits?</p>
          <Button asChild className="bg-gray-900 hover:bg-gray-800">
            <Link to="/book">Book a free 15-minute call</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
