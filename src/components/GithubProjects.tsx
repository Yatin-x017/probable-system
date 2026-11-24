import { ArrowUpRight, Github } from 'lucide-react'
import GlassFolder from '@/components/GlassFolder'

const projects = [
  {
    name: 'Student Bytes',
    description: 'An AI study assistant for computer science students, with study, quiz, notes, and progress features.',
    url: 'https://github.com/Yatin-x017/StudentBytes',
    art: 'glacier' as const,
    files: [
      { name: 'Study workspace', meta: 'DSA · OS · DBMS', art: 'glacier' as const },
      { name: 'Practice & review', meta: 'Quizzes · notes · progress', art: 'aurora' as const },
    ],
  },
  {
    name: 'BMB',
    description: 'A customer ledger for tracking udhar, receivables, advances, and day-to-day entries.',
    url: 'https://github.com/Yatin-x017/BMB',
    art: 'verdant' as const,
    files: [
      { name: 'Party ledger', meta: 'Customers · balances', art: 'verdant' as const },
      { name: 'Daily entries', meta: 'Receivables · advances', art: 'ember' as const },
    ],
  },
]

export default function GithubProjects() {
  return (
    <section className="py-24 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky">Selected builds</p>
          <h2 className="mt-3 text-display-sm text-gray-900">A couple of things I've been building</h2>
          <p className="mt-3 text-gray-500 leading-relaxed">
            Product experiments from my GitHub, presented as interactive folders. Open a folder to take a closer look.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project, index) => (
            <article key={project.name} className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-layer-sm">
              <div className="flex justify-center rounded-xl bg-gradient-to-br from-gray-50 to-white py-4">
                <GlassFolder
                  label={project.name}
                  meta="GitHub project"
                  tone="light"
                  art={project.art}
                  files={project.files}
                  action="none"
                  width={320}
                  appearDelay={index * 120}
                />
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-gray-500">{project.description}</p>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors hover:text-sky"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  View repository
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
