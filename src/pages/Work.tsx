import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPublishedProjects } from '@/lib/supabase/api'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useRevealUp, useStagger } from '@/lib/motion'
import type { Database } from '@/types/supabase'

type Project = Database['public']['Tables']['projects']['Row']

export default function Work() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const revealUp = useRevealUp()
  const stagger = useStagger()

  useEffect(() => {
    getPublishedProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...revealUp} className="mb-12">
          <h1 className="text-display-md text-gray-900">Work</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl">
            A collection of projects I've worked on — from brand identity and
            design systems to full-stack web applications.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <Skeleton className="aspect-[16/9] w-full rounded-none bg-gray-100" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-1/4 bg-gray-100" />
                  <Skeleton className="h-6 w-2/3 bg-gray-100" />
                  <Skeleton className="h-4 w-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={stagger.item}>
                <Link
                  to={`/work/${project.slug}`}
                  className="group block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-layer-sm hover:shadow-layer-lg transition-shadow duration-300"
                >
                  <div className="aspect-[16/9] bg-gray-50 relative overflow-hidden">
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
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {project.type?.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-sky transition-colors">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-gray-500 line-clamp-2">{project.summary}</p>
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tech_stack.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && projects.length === 0 && (
          <EmptyState message="No projects published yet." />
        )}
      </div>
    </div>
  )
}
