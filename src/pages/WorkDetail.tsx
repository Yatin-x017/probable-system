import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import { motion } from 'framer-motion'
import { getProjectBySlug, getProjectImages } from '@/lib/supabase/api'
import { Skeleton } from '@/components/ui/skeleton'
import VideoPlaceholder from '@/components/VideoPlaceholder'
import { useRevealUp, useStagger, springs } from '@/lib/motion'
import type { Database } from '@/types/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectImage = Database['public']['Tables']['project_images']['Row']

export default function WorkDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const revealUp = useRevealUp()
  const stagger = useStagger()

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)

    getProjectBySlug(slug)
      .then((data) => {
        if (!data) {
          setNotFound(true)
          return
        }
        setProject(data)
        return getProjectImages(data.id)
      })
      .then((imgs) => {
        if (imgs) setImages(imgs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  if (notFound) return <Navigate to="/work" replace />

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-4 w-24 bg-gray-100" />
            <Skeleton className="h-10 w-3/4 bg-gray-100" />
            <Skeleton className="aspect-video w-full rounded-xl bg-gray-100" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-gray-100" />
              <Skeleton className="h-4 w-5/6 bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/work"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all work
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.smooth}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {project.type?.map((t) => (
              <span
                key={t}
                className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-display-md text-gray-900">
            {project.title}
          </h1>
          {project.role && (
            <p className="mt-2 text-gray-500">{project.role}</p>
          )}
        </motion.div>

        {/* Video Placeholder / Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springs.smooth, delay: 0.1 }}
          className="mb-12"
        >
          {project.video_url ? (
            <video
              src={project.video_url}
              className="aspect-video w-full rounded-lg bg-gray-900 object-cover"
              controls
              playsInline
            />
          ) : (
            <VideoPlaceholder
              color="#4A90E2"
              label="Case study intro reel — add one in Admin → Projects"
              className="aspect-video w-full"
            />
          )}
        </motion.div>

        {/* Links */}
        <div className="flex flex-wrap gap-3 mb-12">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Live Site
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Github className="w-4 h-4" />
              Source Code
            </a>
          )}
        </div>

        {/* Problem */}
        {project.problem && (
          <motion.section {...revealUp} className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">The Problem</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.problem}
              </p>
            </div>
          </motion.section>
        )}

        {/* Process */}
        {project.process && (
          <motion.section {...revealUp} className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">The Process</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.process}
              </p>
            </div>
          </motion.section>
        )}

        {/* Gallery */}
        {images.length > 0 && (
          <section className="mb-12">
            <motion.h2 {...revealUp} className="text-xl font-semibold text-gray-900 mb-4">
              Gallery
            </motion.h2>
            <motion.div
              variants={stagger.container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  variants={stagger.item}
                  className="rounded-lg overflow-hidden border border-gray-100"
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || project.title}
                    className="w-full h-auto"
                  />
                  {img.caption && (
                    <p className="text-xs text-gray-400 p-3 bg-gray-50">{img.caption}</p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Outcome */}
        {project.outcome && (
          <motion.section {...revealUp} className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">The Outcome</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.outcome}
              </p>
            </div>
          </motion.section>
        )}

        {/* Tech Stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <motion.section {...revealUp} className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-full border border-gray-100"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Bottom CTA */}
        <motion.div {...revealUp} className="mt-16 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-gray-500">
              Like what you see? Let's work together.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Start a Project
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
