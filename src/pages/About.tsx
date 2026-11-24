import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_ABOUT_PAGE } from '@/lib/content/defaults'
import type { AboutPageContent } from '@/lib/content/defaults'

export default function About() {
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_PAGE)
  const reducedMotion = useReducedMotion()

  useEffect(() => { getSiteContent('about_page').then(setContent).catch(console.error) }, [])

  const { heading, intro, bio_paragraphs, portrait_url, location, quick_facts, skills, experience, cta_heading, cta_body } = content

  return (
    <div className="bg-[#f8f6f1] pb-20 pt-[120px] text-[#121212] sm:pb-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <motion.header initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="grid gap-8 border-b border-[#121212]/20 pb-10 md:grid-cols-[0.85fr_1.15fr] md:items-end md:gap-12 md:pb-14">
          <h1 className="font-display text-[clamp(3.7rem,9vw,8rem)] font-extrabold leading-[0.84] tracking-[-0.08em]">{heading}<span className="text-[#d24b3e]">.</span></h1>
          <p className="max-w-2xl text-lg leading-8 text-[#515d70] sm:text-xl sm:leading-9">{intro}</p>
        </motion.header>

        <section className="grid gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:py-16">
          <div className="max-w-3xl space-y-5 text-[15px] leading-7 text-[#515d70]">
            {bio_paragraphs.map((paragraph, index) => <motion.p key={index} initial={reducedMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.04 }}>{paragraph}</motion.p>)}
            {location && <p className="inline-flex items-center gap-2 border-t border-[#121212]/20 pt-4 text-sm font-semibold text-[#121212]"><MapPin className="h-4 w-4 text-[#d24b3e]" />{location}</p>}
          </div>

          <div className="relative min-h-[280px] overflow-hidden bg-[#121212] sm:min-h-[360px]">
            {portrait_url ? <img src={portrait_url} alt={heading} className="absolute inset-0 h-full w-full object-cover" /> : (
              <>
                <div aria-hidden="true" className="absolute -right-14 -top-20 h-72 w-72 rounded-full border border-[#fec430]/60 sm:h-96 sm:w-96" />
                <div aria-hidden="true" className="absolute -right-1 -top-8 h-56 w-56 rounded-full border border-[#d24b3e]/80 sm:h-72 sm:w-72" />
                <span className="absolute bottom-5 left-5 font-display text-7xl font-extrabold tracking-[-0.09em] text-[#f8f6f1] sm:bottom-8 sm:left-8 sm:text-8xl">yats<span className="text-[#d24b3e]">.</span></span>
                <span className="absolute right-5 top-5 max-w-24 text-right text-[9px] font-semibold uppercase leading-4 tracking-[0.15em] text-[#f8f6f1]/65 sm:right-8 sm:top-8">Yatin Sharma<br />Independent creative</span>
              </>
            )}
          </div>
        </section>

        <section className="grid gap-8 border-y border-[#121212]/20 py-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16 md:py-14">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-[-0.05em] sm:text-4xl">How I work</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#5d6673]">Small enough to stay personal. Broad enough to connect the moving parts.</p>
          </div>
          <dl className="divide-y divide-[#121212]/15">
            {quick_facts.map(({ label, value }) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[0.6fr_1fr] sm:gap-6"><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#737988]">{label}</dt><dd className="text-sm font-semibold text-[#121212]">{value}</dd></div>)}
          </dl>
        </section>

        <section className="grid gap-8 py-12 md:grid-cols-[0.7fr_1.3fr] md:gap-16 md:py-16">
          <h2 className="font-display text-3xl font-bold tracking-[-0.05em] sm:text-4xl">What I bring</h2>
          <div className="divide-y divide-[#121212]/15 border-y border-[#121212]/20">
            {skills.map((group) => <div key={group.category} className="grid gap-2 py-4 sm:grid-cols-[0.6fr_1fr] sm:gap-6"><h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#737988]">{group.category}</h3><p className="text-sm leading-6 text-[#121212]">{group.items.join(' · ')}</p></div>)}
          </div>
        </section>

        {experience.length > 0 && (
          <section className="border-t border-[#121212]/20 py-12 md:py-16">
            <h2 className="font-display text-3xl font-bold tracking-[-0.05em] sm:text-4xl">Experience</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {experience.map((job, index) => <article key={`${job.company}-${index}`} className="border-t-2 border-[#d24b3e] pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#737988]">{job.period}</p><h3 className="mt-2 font-display text-xl font-bold tracking-[-0.04em]">{job.title}</h3><p className="mt-1 text-sm text-[#5d6673]">{job.company}</p><p className="mt-3 text-sm leading-6 text-[#515d70]">{job.description}</p></article>)}
            </div>
          </section>
        )}

        <motion.section initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="mt-4 flex flex-col gap-6 bg-[#fec430] p-6 sm:p-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-[12ch] font-display text-4xl font-bold leading-[0.95] tracking-[-0.055em] sm:text-5xl">{cta_heading}</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#121212]/75">{cta_body}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-5">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-[#121212] px-5 py-3 text-sm font-semibold text-[#f8f6f1] transition-colors hover:bg-[#d24b3e] hover:text-[#121212]">Get in touch<ArrowRight className="h-4 w-4" /></Link>
            <Link to="/work" className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-[#d24b3e] decoration-2 underline-offset-4">See my work<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
