import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_ABOUT_PAGE } from '@/lib/content/defaults'
import { useRevealUp, useStagger, useParallax } from '@/lib/motion'
import type { AboutPageContent } from '@/lib/content/defaults'

export default function About() {
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_PAGE)

  useEffect(() => {
    getSiteContent('about_page').then(setContent).catch(console.error)
  }, [])

  const { heading, intro, bio_paragraphs, portrait_url, location, years_experience, quick_facts, skills, experience, cta_heading, cta_body } = content
  const portrait = useParallax(30)
  const revealUp = useRevealUp()
  const stagger = useStagger()

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div {...revealUp} className="mb-16">
          <h1 className="text-display-md text-gray-900">{heading}</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl">{intro}</p>
        </motion.div>

        {/* Bio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2 space-y-6">
            {portrait_url && (
              <motion.div
                ref={portrait.ref as React.RefObject<HTMLDivElement>}
                style={{ y: portrait.y }}
                className="w-full max-w-sm mb-2"
              >
                <img
                  src={portrait_url}
                  alt={heading}
                  className="w-full rounded-xl object-cover aspect-[4/3]"
                />
              </motion.div>
            )}
            {bio_paragraphs.map((p, i) => (
              <p key={i} className="text-gray-600 leading-relaxed">
                {p}
              </p>
            ))}

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {years_experience} years experience
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Facts
            </h3>
            <ul className="space-y-3">
              {quick_facts.map(({ label, value }) => (
                <li key={label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-gray-700 font-medium">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Skills */}
        <section className="mb-20">
          <motion.h2 {...revealUp} className="text-display-sm text-gray-900 mb-8">
            Skills & Tools
          </motion.h2>
          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {skills.map((group) => (
              <motion.div
                key={group.category}
                variants={stagger.item}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Experience */}
        <section className="mb-20">
          <motion.h2 {...revealUp} className="text-display-sm text-gray-900 mb-8">
            Experience
          </motion.h2>
          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-8"
          >
            {experience.map((job, i) => (
              <motion.div
                key={i}
                variants={stagger.item}
                className="relative pl-8 border-l-2 border-gray-100"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-sky" />
                <div className="mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {job.company} · {job.period}
                  </p>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  {job.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <motion.section {...revealUp} className="bg-[#F8F9FA] rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-display-sm text-gray-900 mb-3">{cta_heading}</h2>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">{cta_body}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              See My Work
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
