import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import GithubProjects from '@/components/GithubProjects'
import { getFeaturedProjects } from '@/lib/supabase/api'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_HERO, DEFAULT_ABOUT_TEASER, DEFAULT_CTA } from '@/lib/content/defaults'
import type { HeroContent, AboutTeaserContent, CtaContent } from '@/lib/content/defaults'
import type { Database } from '@/types/supabase'

type Project = Database['public']['Tables']['projects']['Row']

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to={`/work/${project.slug}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#426fbd]">
        <div className="relative aspect-[1.18] overflow-hidden bg-[#e9c961]">
          {project.cover_image_url ? (
            <img src={project.cover_image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#182338] px-8 text-center text-[#f6f1e8]">
              <span className="font-display text-4xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-5xl">{project.title}</span>
            </div>
          )}
          <span className="absolute bottom-4 left-4 inline-flex max-w-[calc(100%-2rem)] bg-[#f6f1e8] px-3 py-1.5 text-[11px] font-semibold text-[#182338]">
            {project.type?.[0] ?? 'Selected work'}
          </span>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-5 pt-4">
        <div>
          <h3 className="font-display text-xl font-bold tracking-[-0.04em] text-[#182338] sm:text-2xl">{project.title}</h3>
          {project.summary && <p className="mt-2 max-w-xl text-sm leading-6 text-[#555f6f]">{project.summary}</p>}
        </div>
        <Link to={`/work/${project.slug}`} aria-label={`View ${project.title}`} className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#182338]/25 text-[#182338] transition-colors hover:border-[#f05b43] hover:bg-[#f05b43]">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  )
}

const services = [
  {
    title: 'Identity',
    description: 'A visual language with enough character to be recognised and enough structure to be used.',
    note: 'Logo · art direction · social kit',
  },
  {
    title: 'Web',
    description: 'A useful, responsive home for your business that gives people a clear next step.',
    note: 'Strategy · design · build',
  },
  {
    title: 'Social',
    description: 'A practical content system that sounds and looks like the same business every week.',
    note: 'Planning · creative · management',
  },
]

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO)
  const [about, setAbout] = useState<AboutTeaserContent>(DEFAULT_ABOUT_TEASER)
  const [cta, setCta] = useState<CtaContent>(DEFAULT_CTA)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    getFeaturedProjects().then(setProjects).catch(console.error).finally(() => setLoading(false))
    getSiteContent('home_hero').then(setHero).catch(console.error)
    getSiteContent('home_about_teaser').then(setAbout).catch(console.error)
    getSiteContent('home_cta').then(setCta).catch(console.error)
  }, [])

  return (
    <div className="overflow-hidden bg-[#f6f1e8] text-[#182338]">
      <section className="relative isolate min-h-[820px] overflow-hidden bg-[#f6f1e8] lg:min-h-[calc(100svh-76px)]">
        <motion.div
          initial={false}
          animate={reducedMotion ? { clipPath: 'inset(0 0 0 0)' } : { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }}
          transition={{ duration: reducedMotion ? 0 : 0.95, delay: reducedMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 -z-10 overflow-hidden"
        >
          <img
            src="/yats-studio-illustration.webp"
            alt="A warm, illustrated creative workspace with print studies, a camera, sketchbook, and drawing tools."
            width="1280"
            height="720"
            fetchPriority="high"
            className="h-full w-full object-cover object-[57%_center]"
          />
        </motion.div>
        <div className="mx-auto flex min-h-[820px] max-w-[1440px] flex-col justify-center px-5 pb-28 pt-[120px] sm:px-8 lg:min-h-[calc(100svh-76px)] lg:px-12">
          <div className="relative z-10 max-w-[650px] py-5 lg:w-[48%]">
            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[9ch] font-display text-[clamp(3.5rem,8vw,7.6rem)] font-extrabold leading-[0.86] tracking-[-0.075em] text-[#182338]"
            >
              <span className="block">{hero.heading_top}</span>
              <span className="block text-[#f05b43]">{hero.heading_highlight}</span>
              <span className="mt-2 block max-w-[9ch] text-[0.45em] leading-[1.04] tracking-[-0.045em] text-[#182338]">{hero.heading_bottom}</span>
            </motion.h1>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-[34rem]"
            >
              <p className="text-[15px] leading-7 text-[#515d70] sm:text-base sm:leading-8">{hero.subheading}</p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button asChild size="lg" className="group h-12 rounded-none bg-[#182338] px-5 font-semibold text-[#f6f1e8] hover:bg-[#f05b43] hover:text-[#182338]">
                  <Link to={hero.primary_cta_href}>{hero.primary_cta_label}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                </Button>
                <Link to={hero.secondary_cta_href} className="text-sm font-semibold text-[#182338] underline decoration-[#f05b43] decoration-2 underline-offset-4 transition-colors hover:text-[#f05b43]">{hero.secondary_cta_label}</Link>
              </div>
            </motion.div>

            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#182338]/20 pt-4 text-[11px] font-semibold uppercase tracking-[0.11em] text-[#555f6f]">
              <span>Identity</span><span className="text-[#f05b43]">/</span><span>Web</span><span className="text-[#f05b43]">/</span><span>Social</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] items-center justify-between border-t border-[#182338]/15 bg-[#f6f1e8]/85 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#697282] backdrop-blur-[2px] sm:px-8 lg:px-12">
          <span>Independent creative practice</span>
          <span>Available for select projects</span>
        </div>
      </section>

      <section id="services" className="bg-[#182338] text-[#f6f1e8]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
            <div>
              <p className="text-sm leading-6 text-[#f6f1e8]/65">A focused practice for businesses that want the details to add up.</p>
              <h2 className="mt-8 max-w-[9ch] font-display text-5xl font-bold leading-[0.95] tracking-[-0.06em] sm:text-6xl">The whole thing should feel like one thing.</h2>
              <Link to="/pricing" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#efc65f] transition-colors hover:text-[#f05b43]">Explore services<ArrowUpRight className="h-4 w-4" /></Link>
            </div>

            <div className="border-t border-white/25">
              {services.map((service, index) => (
                <motion.article
                  key={service.title}
                  initial={reducedMotion ? false : { opacity: 0.4, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: reducedMotion ? 0 : 0.42, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-3 border-b border-white/25 py-6 sm:grid-cols-[0.7fr_1.3fr] sm:gap-8 sm:py-8"
                >
                  <div>
                    <h3 className="font-display text-2xl font-bold tracking-[-0.045em] sm:text-3xl">{service.title}</h3>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#efc65f]">{service.note}</p>
                  </div>
                  <p className="max-w-[38rem] text-sm leading-6 text-[#f6f1e8]/70 sm:pt-1">{service.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {(loading || projects.length > 0) && (
        <section className="bg-[#f6f1e8] py-20 sm:py-28">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 flex items-end justify-between gap-6 border-b border-[#182338]/20 pb-5 sm:mb-12">
              <div>
                <h2 className="font-display text-4xl font-bold tracking-[-0.055em] sm:text-6xl">Selected work</h2>
                <p className="mt-3 text-sm text-[#5d6673]">The details are the difference.</p>
              </div>
              <Link to="/work" className="hidden items-center gap-2 pb-1 text-sm font-semibold text-[#182338] sm:inline-flex">All work<ArrowUpRight className="h-4 w-4 text-[#f05b43]" /></Link>
            </div>
            {loading ? (
              <div className="grid gap-8 md:grid-cols-2">{[0, 1].map((item) => <div key={item}><Skeleton className="aspect-[1.18] rounded-none bg-[#e4dfd3]" /><Skeleton className="mt-5 h-6 w-1/2 rounded-none bg-[#e4dfd3]" /></div>)}</div>
            ) : (
              <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:gap-x-12">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}</div>
            )}
            <Link to="/work" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold sm:hidden">All work<ArrowUpRight className="h-4 w-4 text-[#f05b43]" /></Link>
          </div>
        </section>
      )}

      <GithubProjects />

      <section className="bg-[#e8b94f] text-[#182338]">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-12">
          <div>
            <h2 className="max-w-[11ch] font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] sm:text-7xl">{about.heading}</h2>
            <p className="mt-6 max-w-[42rem] text-base leading-7 text-[#182338]/80">{about.body}</p>
            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#182338]/70">
              {about.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-bold underline decoration-[#f05b43] decoration-2 underline-offset-4">More about Yats<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative flex min-h-[280px] items-end justify-between overflow-hidden bg-[#182338] p-6 text-[#f6f1e8] sm:min-h-[340px] sm:p-8">
            <div aria-hidden="true" className="absolute -right-14 -top-20 h-64 w-64 rounded-full border border-[#efc65f]/50 sm:h-80 sm:w-80" />
            <div aria-hidden="true" className="absolute -right-1 -top-8 h-52 w-52 rounded-full border border-[#f05b43]/70 sm:h-64 sm:w-64" />
            <span className="relative font-display text-[6rem] font-extrabold leading-none tracking-[-0.09em] text-[#f05b43] sm:text-[8rem]">yats<span className="text-[#efc65f]">.</span></span>
            <span className="relative text-right text-[10px] font-semibold uppercase leading-5 tracking-[0.12em] text-[#f6f1e8]/70">Independent<br />by design</span>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f1e8] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 border-t border-[#182338]/20 pt-8 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-[10ch] font-display text-5xl font-bold leading-[0.95] tracking-[-0.06em] sm:text-7xl">{cta.heading}</h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#5d6673]">{cta.body}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-4">
            <Button asChild size="lg" className="group h-12 rounded-none bg-[#f05b43] px-5 font-semibold text-[#182338] hover:bg-[#182338] hover:text-[#f6f1e8]">
              <Link to={cta.primary_cta_href}>{cta.primary_cta_label}<ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
            </Button>
            <Link to={cta.secondary_cta_href} className="text-sm font-semibold underline decoration-[#426fbd] decoration-2 underline-offset-4">{cta.secondary_cta_label}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
