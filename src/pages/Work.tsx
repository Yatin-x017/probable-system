import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Github } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { getPublishedProjects } from '@/lib/supabase/api'
import { Skeleton } from '@/components/ui/skeleton'
import type { Database } from '@/types/supabase'

type Project = Database['public']['Tables']['projects']['Row']

export default function Work() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    getPublishedProjects().then(setProjects).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-[75svh] bg-[#f8f6f1] pb-20 pt-[120px] text-[#121212] sm:pb-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-12 max-w-4xl border-b border-[#121212]/20 pb-8 sm:mb-16">
          <h1 className="font-display text-[clamp(3.5rem,8vw,7rem)] font-extrabold leading-[0.88] tracking-[-0.075em]">Work<span className="text-[#d24b3e]">.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#555f6f] sm:text-lg sm:leading-8">A few real things I’ve made, tested, and learned from — in brand, web, and product.</p>
        </motion.div>

        {loading ? (
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
            {[0, 1, 2, 3].map((item) => <div key={item}><Skeleton className="aspect-[1.18] rounded-none bg-[#e5dfd1]" /><Skeleton className="mt-5 h-6 w-1/2 rounded-none bg-[#e5dfd1]" /></div>)}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:gap-x-12">
            {projects.map((project, index) => (
              <motion.article key={project.id} initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.42, delay: index * 0.05 }} className="group">
                <Link to={`/work/${project.slug}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b44]">
                  <div className="relative aspect-[1.18] overflow-hidden bg-[#121212]">
                    {project.cover_image_url ? <img src={project.cover_image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center px-6 text-center"><span className="font-display text-5xl font-bold tracking-[-0.055em] text-[#f8f6f1] sm:text-7xl">{project.title}</span></div>}
                    <span className="absolute bottom-4 left-4 bg-[#f8f6f1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#121212]">{project.type?.[0] ?? 'Project'}</span>
                  </div>
                </Link>
                <div className="flex items-start justify-between gap-5 pt-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-[-0.045em]">{project.title}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#555f6f]">{project.summary}</p>
                    {!!project.tech_stack?.length && <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#737988]">{project.tech_stack.join(' · ')}</p>}
                  </div>
                  <Link to={`/work/${project.slug}`} aria-label={`View ${project.title}`} className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#121212]/25 text-[#121212] transition-colors hover:border-[#d24b3e] hover:bg-[#d24b3e]"><ArrowUpRight className="h-4 w-4" /></Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8 border-y border-[#121212]/20 py-10 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.05em] sm:text-4xl">The case studies are still taking shape.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#555f6f]">The public repos are here if you want to see what I’m building while I put together fuller project stories.</p>
            </div>
            <a href="https://github.com/Yatin-x017" target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 bg-[#121212] px-5 py-3 text-sm font-semibold text-[#f8f6f1] transition-colors hover:bg-[#d24b3e] hover:text-[#121212]">Browse GitHub<Github className="h-4 w-4" /><ArrowUpRight className="h-4 w-4" /></a>
          </div>
        )}
      </div>
    </div>
  )
}
