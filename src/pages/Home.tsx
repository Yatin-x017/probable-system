import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import HeroScene from '@/components/HeroScene'
import VideoPlaceholder from '@/components/VideoPlaceholder'
import { ThreeDMarquee } from '@/components/ui/3d-marquee'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { getFeaturedProjects } from '@/lib/supabase/api'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_HERO, DEFAULT_ABOUT_TEASER, DEFAULT_CTA, DEFAULT_MARQUEE } from '@/lib/content/defaults'
import type { HeroContent, AboutTeaserContent, CtaContent, MarqueeContent } from '@/lib/content/defaults'
import type { Database } from '@/types/supabase'
import { springs, useRevealUp } from '@/lib/motion'

// Staggered reveal for hero content — each child settles in with the shared
// spring language instead of a flat fade, so the first 3 seconds feel alive.
const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}
const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: springs.smooth },
}

type Project = Database['public']['Tables']['projects']['Row']

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-layer-sm hover:shadow-layer-lg transition-shadow duration-300"
    >
      <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50" />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {project.type?.map((t) => (
            <span
              key={t}
              className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
            >
              {t}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sky transition-colors">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.summary}</p>
      </div>
    </Link>
  )
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO)
  const [aboutTeaser, setAboutTeaser] = useState<AboutTeaserContent>(DEFAULT_ABOUT_TEASER)
  const [cta, setCta] = useState<CtaContent>(DEFAULT_CTA)
  const [marquee, setMarquee] = useState<MarqueeContent>(DEFAULT_MARQUEE)

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

  const revealUp = useRevealUp()

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <HeroScene />

        {/* Very subtle noise texture — breaks up flat gradients, reads as premium not flashy */}
        <div
          className="pointer-events-none absolute inset-0 z-[6] opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.h1
            variants={heroItem}
            className="text-display-lg"
          >
            <span className="frosted-text">{hero.heading_top}</span>
            <br />
            <span className="frosted-text frosted-text--muted">{hero.heading_highlight}</span>
            <br />
            <span className="frosted-text">{hero.heading_bottom}</span>
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            {hero.subheading}
          </motion.p>
          <motion.div
            variants={heroItem}
            className="mt-10 flex justify-center"
          >
            <Button asChild size="lg" className="rounded-lg">
              <Link to="/pricing">
                Know what suits you
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Work Section */}
      <section className="relative py-24 bg-[#F8F9FA] overflow-hidden">
        {/* Soft ambient light blobs — same technique as the reference (isolated,
            rotated radial gradients) but in neutral/white tones for the light theme. */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none isolate opacity-70 contain-strict hidden lg:block"
        >
          <div className="w-[35rem] h-[80rem] -translate-y-[22rem] absolute right-0 top-0 rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,0%,.035)_0,hsla(0,0%,0%,.01)_50%,transparent_80%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...revealUp}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-display-sm text-gray-900">Featured Work</h2>
              <p className="mt-2 text-gray-500">
                A selection of recent projects
              </p>
            </div>
            <Link
              to="/work"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              View all projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full rounded-none bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-1/3 bg-gray-100" />
                    <Skeleton className="h-5 w-3/4 bg-gray-100" />
                    <Skeleton className="h-4 w-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <>
              {/* Spotlight preview of the lead project — perspective-tilted
                  screenshot, mask-fades out at the edges. Purely decorative,
                  the actual click target is the project's own card below. */}
              {projects[0].cover_image_url && (
                <motion.div
                  {...revealUp}
                  className="mb-16 mx-auto max-w-6xl [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
                >
                  <Link
                    to={`/work/${projects[0].slug}`}
                    aria-label={`Open ${projects[0].title}`}
                    className="block [perspective:1200px] [mask-image:linear-gradient(to_right,black_60%,transparent_100%)] -mr-16 pl-16 lg:-mr-40 lg:pl-40"
                  >
                    <div style={{ transform: 'rotateX(18deg)' }}>
                      <div className="relative skew-x-[.28rad] lg:h-[26rem] rounded-xl overflow-hidden border border-gray-200 shadow-layer-xl">
                        <img
                          src={projects[0].cover_image_url}
                          alt={projects[0].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ ...springs.smooth, delay: i * 0.06 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              size="compact"
              message="No featured projects yet"
              action={
                <Link
                  to="/admin/projects"
                  className="inline-flex items-center gap-1 text-sm text-sky hover:underline"
                >
                  Add projects in the admin
                  <ExternalLink className="w-3 h-3" />
                </Link>
              }
            />
          )}
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...revealUp}>
              <h2 className="text-display-sm text-gray-900">
                {aboutTeaser.heading}
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                {aboutTeaser.body}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {aboutTeaser.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-full border border-gray-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-sky transition-colors"
              >
                More about me
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={springs.smooth}
              className="relative"
            >
              {aboutTeaser.image_url ? (
                <img
                  src={aboutTeaser.image_url}
                  alt={aboutTeaser.heading}
                  className="aspect-[4/3] w-full object-cover rounded-lg shadow-layer-md"
                />
              ) : (
                <VideoPlaceholder
                  color="#6BCB77"
                  label="Add an image in Admin → Content → Home"
                  className="aspect-[4/3] w-full"
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <motion.div
          {...revealUp}
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-display-sm text-white">
            {cta.heading}
          </h2>
          <p className="mt-4 text-gray-400">
            {cta.body}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-lg bg-white text-gray-900 hover:bg-gray-100">
              <Link to={cta.primary_cta_href}>{cta.primary_cta_label}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-lg bg-gray-800 text-white hover:bg-gray-700">
              <Link to={cta.secondary_cta_href}>{cta.secondary_cta_label}</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Work Marquee */}
      {marquee.images.length > 0 && (
        <section className="py-24 bg-white overflow-hidden">
          <motion.div {...revealUp} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-4">
            <h2 className="text-display-sm text-gray-900">{marquee.heading}</h2>
            <p className="mt-2 text-gray-500">{marquee.body}</p>
          </motion.div>
          <ThreeDMarquee images={marquee.images} className="max-w-none rounded-none" />
        </section>
      )}
    </div>
  )
}
