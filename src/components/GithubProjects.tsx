import { ArrowUpRight, Github } from 'lucide-react'
import GlassFolder from '@/components/GlassFolder'

const seaGlass = {
  style: 'streak' as const,
  colors: ['#f1f0e8', '#d4e7df', '#9ebfb2', '#7e9c94', '#c9c3da', '#eee7df'],
  scale: 0.72,
  warp: 1.45,
  angle: -0.38,
  gloss: 0.32,
  veins: 0.08,
}

const projects = [
  {
    name: 'Student Bytes',
    description: 'An AI study assistant for computer science students, with study, quiz, notes, and progress features.',
    url: 'https://github.com/Yatin-x017/StudentBytes',
    files: [
      { name: 'Study workspace', meta: 'DSA · OS · DBMS', art: seaGlass },
      { name: 'Practice & review', meta: 'Quizzes · notes · progress', art: seaGlass },
    ],
  },
  {
    name: 'BMB',
    description: 'A customer ledger for tracking udhar, receivables, advances, and day-to-day entries.',
    url: 'https://github.com/Yatin-x017/BMB',
    files: [
      { name: 'Party ledger', meta: 'Customers · balances', art: seaGlass },
      { name: 'Daily entries', meta: 'Receivables · advances', art: seaGlass },
    ],
  },
]

export default function GithubProjects() {
  return (
    <section className="bg-[#f7f5ef] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col gap-4 border-b border-[#dcded6] pb-8 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#648c7e]">From the workbench</p>
            <h2 className="mt-3 max-w-[14ch] text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#1c2522] sm:text-5xl">
              Products and experiments.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#69726d]">
            A few things I’ve been building and learning from in public.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {projects.map((project, index) => (
            <article key={project.name} className="min-w-0">
              <div className="flex min-h-[340px] items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#e9e8e1] px-3 py-2 sm:min-h-[380px]">
                <GlassFolder
                  label={project.name}
                  meta="GitHub project"
                  tone="light"
                  art={seaGlass}
                  files={project.files}
                  action="none"
                  width={320}
                  appearDelay={index * 120}
                />
              </div>
              <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#1c2522]">{project.name}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#69726d]">{project.description}</p>
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#46584f] transition-colors hover:text-[#648c7e]"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  Repository
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
