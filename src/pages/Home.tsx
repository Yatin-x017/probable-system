import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import GlassReveal from '@/components/GlassRevealYats'
import GithubProjects from '@/components/GithubProjects'
import { ThreeDMarquee } from '@/components/ui/3d-marquee'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getFeaturedProjects } from '@/lib/supabase/api'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_HERO, DEFAULT_ABOUT_TEASER, DEFAULT_CTA, DEFAULT_MARQUEE } from '@/lib/content/defaults'
import type { HeroContent, AboutTeaserContent, CtaContent, MarqueeContent } from '@/lib/content/defaults'
import type { Database } from '@/types/supabase'
import { springs, useRevealUp } from '@/lib/motion'

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: springs.smooth },
}

type Project = Database['public']['Tables']['projects']['Row']

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group">
      <Link
        to={`/work/${project.slug}`}
        className="block overflow-hidden rounded-[1.35rem] bg-[#e8e9e2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#547d73]"
        aria-label={`View ${project.title}`}
      >
        <div className="relative aspect-[1.25] overflow-hidden">
          {project.cover_image_url ? (
            <img
              src={project.cover_image_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_50%_45%,#dce9e2_0%,#e8e9e2_60%,#ede9e2_100%)]">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/70 bg-white/35 text-4xl font-medium tracking-[-0.08em] text-[#547d73] shadow-[0_12px_40px_rgba(40,63,54,0.08)]">
                {project.title.slice(0, 1)}
              </div>
            </div>
          )}
          <span className="absolute bottom-4 left-4 rounded-full border border-white/50 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#36443d] backdrop-blur-sm">
            {project.type?.[0] ?? 'Selected work'}
          </span>
        </div>
      </Link>

      <div className="flex items-start justify-between gap-5 px-1 pt-5">
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#1c2522] sm:text-2xl">
            {project.title}
          </h3>
          {project.summary && (
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#69726d]">
              {project.summary}
            </p>
          )}
        </div>
        <Link
          to={`/work/${project.slug}`}
          aria-label={`Read the ${project.title} case study`}
          className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9ded8] text-[#36443d] transition-colors hover:border-[#547d73] hover:bg-[#547d73] hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

const services = [
  {
    number: '01',
    title: 'Brand identity',
    description: 'Visual direction and practical identity systems that give every touchpoint a common thread.',
  },
  {
    number: '02',
    title: 'Web design',
    description: 'Responsive websites with a clear story, thoughtful details, and an easy next step.',
  },
  {
    number: '03',
    title: 'Social presence',
    description: 'Content planning and day-to-day creative support to keep your channels recognizably yours.',
  },
]

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO)
  const [aboutTeaser, setAboutTeaser] = useState<AboutTeaserContent>(DEFAULT_ABOUT_TEASER)
  const [cta, setCta] = useState<CtaContent>(DEFAULT_CTA)
  const [marquee, setMarquee] = useState<MarqueeContent>(DEFAULT_MARQUEE)
  const revealUp = useRevealUp()

  useEffect(() => {
    getFeaturedProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false))

    getSiteContent('home_hero').then(setHero).catch(console.error)
    getSiteContent('home_about_teaser').then(setAboutTeaser).catch(console.error)
    getSiteContent('home_cta').then(setCta).catch(console.error)
    getSiteContent('home_marquee').then(setMarquee).catch(console.error)
  }, [])

  return (
    <div className="bg-[#f7f5ef] text-[#1c2522]">
      <section className="relative isolate flex min-h-[88svh] items-center overflow-hidden bg-[#f1efe8]">
        <div aria-hidden="true" className="pointer-events-none absolute right-[10%] top-1/2 z-0 hidden h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-[#dce8df]/80 blur-3xl md:block" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-t from-[#f1efe8] to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 px-5 pb-16 pt-32 sm:px-8 md:grid-cols-[1.08fr_0.92fr] md:gap-4 md:px-12 lg:px-20">
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="show"
            className="max-w-[720px]"
          >
            <motion.p
              variants={heroItem}
              className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#547d73] sm:text-xs"
            >
              <span className="h-px w-8 bg-[#7ba99a]" />
              Yats · independent creative practice
            </motion.p>

            <motion.h1
              variants={heroItem}
              className="mt-7 max-w-[13ch] text-[clamp(3.5rem,7.1vw,7.25rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-[#1c2522]"
            >
              <span className="block">{hero.heading_top}</span>
              <span className="block text-[#5d8b7d]">{hero.heading_highlight}</span>
              <span className="block">{hero.heading_bottom}</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mt-7 max-w-[34rem] text-base leading-7 text-[#626b66] sm:text-lg sm:leading-8"
            >
              {hero.subheading}
            </motion.p>

            <motion.div variants={heroItem} className="mt-9 flex flex-wrap items-center gap-5">
              <Button asChild size="lg" className="h-12 rounded-full bg-[#1c2522] px-6 text-white hover:bg-[#34463e]">
                <Link to={hero.primary_cta_href}>
                  {hero.primary_cta_label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                to={hero.secondary_cta_href}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#36443d] transition-colors hover:text-[#5d8b7d]"
              >
                {hero.secondary_cta_label}
                <span aria-hidden="true">↗</span>
              </Link>
            </motion.div>

            <motion.div variants={heroItem} className="mt-12 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-[#737b75]">
              <span>Brand identity</span><span aria-hidden="true">·</span>
              <span>Web design</span><span aria-hidden="true">·</span>
              <span>Social media</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.2 }}
            className="relative hidden min-h-[470px] items-center justify-center md:flex"
          >
            <div aria-hidden="true" className="absolute h-[410px] w-[410px] rounded-full border border-white/70 bg-white/15 shadow-[0_30px_100px_rgba(54,75,66,0.08)]" />
            <div aria-hidden="true" className="absolute h-[325px] w-[325px] rounded-full border border-[#b6c9be]/60" />
            <GlassReveal
              label="Yats liquid glass mark"
              look="dark"
              background="#17201d"
              logoColor="#a6e4d8"
              tileSize={192}
              logoScale={0.5}
              finalScale={0.78}
              loop={false}
              className="relative z-10 h-[250px] w-[250px] rounded-full border border-white/25 shadow-[0_28px_70px_rgba(25,43,36,0.24)]"
            />
            <span className="absolute left-3 top-[17%] rounded-full border border-white/80 bg-[#f8f6f1]/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#52685f] backdrop-blur-sm">
              Identity · web · social
            </span>
            <span className="absolute bottom-[15%] right-0 rounded-full border border-white/80 bg-[#f8f6f1]/85 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#52685f] backdrop-blur-sm">
              Made by Yatin
            </span>
          </motion.div>
        </div>

        <span className="absolute bottom-8 left-5 z-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a817a] sm:left-8 md:left-12 lg:left-20">
          Scroll to explore
        </span>
        <span aria-hidden="true" className="absolute bottom-8 right-5 z-10 h-8 w-px bg-[#a8b5ab] sm:right-8 md:right-12 lg:right-20" />
      </section>

      <section id="services" className="border-b border-[#e4e1d9] bg-[#f7f5ef] py-20 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#648c7e]">What I can help with</p>
              <h2 className="mt-3 max-w-[13ch] text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#1c2522] sm:text-4xl">
                One clear brand, across every touchpoint.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#69726d]">
              A focused set of creative services for small teams and independent businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 border-t border-[#dcded6] md:grid-cols-3">
            {services.map((service) => (
              <div key={service.number} className="border-b border-[#dcded6] py-7 md:border-b-0 md:px-7 md:py-8 md:first:pl-0 md:last:pr-0 md:border-l md:first:border-l-0 md:border-[#dcded6]">
                <span className="text-[11px] font-medium tracking-[0.14em] text-[#8a958d]">{service.number}</span>
                <h3 className="mt-7 text-xl font-semibold tracking-[-0.03em] text-[#26322d]">{service.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#69726d]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(loading || projects.length > 0) && (
        <section className="bg-[#eeece5] py-20 sm:py-28">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 flex items-end justify-between gap-5 sm:mb-14">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#648c7e]">Selected work</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[#1c2522] sm:text-5xl">Made with intention.</h2>
              </div>
              <Link to="/work" className="hidden items-center gap-2 pb-1 text-sm font-medium text-[#46584f] transition-colors hover:text-[#648c7e] sm:inline-flex">
                All work <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-9 md:grid-cols-2">
                {[0, 1].map((item) => (
                  <div key={item} className="overflow-hidden rounded-[1.35rem]">
                    <Skeleton className="aspect-[1.25] w-full rounded-none bg-[#e1dfd7]" />
                    <div className="space-y-3 px-1 pt-5">
                      <Skeleton className="h-5 w-1/2 bg-[#e1dfd7]" />
                      <Skeleton className="h-4 w-4/5 bg-[#e1dfd7]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:gap-x-10">
                {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
              </div>
            )}

            <Link to="/work" className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-[#46584f] sm:hidden">
              All work <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <GithubProjects />

      <section className="bg-[#e6ebe5] py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:px-12">
          <motion.div {...revealUp}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#648c7e]">A little about the practice</p>
            <h2 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.04] tracking-[-0.06em] text-[#1c2522] sm:text-5xl">
              {aboutTeaser.heading}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#596761]">{aboutTeaser.body}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {aboutTeaser.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-[#cfd9d1] bg-white/50 px-3 py-1.5 text-xs font-medium text-[#52685f]">
                  {skill}
                </span>
              ))}
            </div>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#263c34] hover:text-[#648c7e]">
              More about Yats <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={springs.smooth}
            className="relative overflow-hidden rounded-[1.5rem] bg-[#1c2522]"
          >
            {aboutTeaser.image_url ? (
              <img src={aboutTeaser.image_url} alt={aboutTeaser.heading} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_at_50%_43%,rgba(117,159,143,0.22),transparent_58%)]">
                <img src="/yats-mark.svg" alt="" className="h-28 w-28 sm:h-36 sm:w-36" />
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/55">Yats · design / web / social</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1c2522] py-20 text-white sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-52 h-[28rem] w-[28rem] rounded-full border border-white/10 sm:h-[38rem] sm:w-[38rem]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 h-[24rem] w-[24rem] rounded-full border border-white/10 sm:h-[32rem] sm:w-[32rem]" />
        <motion.div {...revealUp} className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a6d4c4]">Have a good one in mind?</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-6xl">
            {cta.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/65">{cta.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full bg-[#f5f2e9] px-6 text-[#1c2522] hover:bg-white">
              <Link to={cta.primary_cta_href}>{cta.primary_cta_label}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Link to={cta.secondary_cta_href} className="text-sm font-medium text-white/75 transition-colors hover:text-white">
              {cta.secondary_cta_label}
            </Link>
          </div>
        </motion.div>
      </section>

      {marquee.images.length > 0 && (
        <section className="overflow-hidden bg-[#f7f5ef] py-20">
          <motion.div {...revealUp} className="mx-auto mb-8 max-w-3xl px-5 text-center sm:px-8">
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#1c2522] sm:text-4xl">{marquee.heading}</h2>
            <p className="mt-3 text-sm leading-6 text-[#69726d]">{marquee.body}</p>
          </motion.div>
          <ThreeDMarquee images={marquee.images} className="max-w-none rounded-none" />
        </section>
      )}
    </div>
  )
}
