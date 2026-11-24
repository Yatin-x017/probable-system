import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Github } from 'lucide-react'

const projects = [
  {
    name: 'Student Bytes',
    discipline: 'Product · self-initiated',
    description: 'A study companion for computer science students, built around notes, quizzes and progress.',
    url: 'https://github.com/Yatin-x017/StudentBytes',
    theme: 'bg-[#2f6b44] text-[#f8f6f1]',
    art: 'student',
  },
  {
    name: 'LibraryOS',
    discipline: 'Product · open source',
    description: 'Attendance, fee tracking and staff tools for a library with more than 300 members.',
    url: 'https://github.com/Yatin-x017/libraryapp',
    theme: 'bg-[#fec430] text-[#121212]',
    art: 'library',
  },
  {
    name: 'Crumb & Confetti',
    discipline: 'Product concept · full-stack',
    description: 'A cafe and bakery reservation experience, from guest booking through the admin flow.',
    url: 'https://github.com/Yatin-x017/tablecraft',
    theme: 'bg-[#d24b3e] text-[#121212]',
    art: 'crumb',
  },
]

function ProjectArtwork({ kind, theme }: { kind: string; theme: string }) {
  if (kind === 'student') {
    return (
      <div aria-label="Graphic cover for Student Bytes, a computer science study companion" role="img" className={`relative flex aspect-[1.25] overflow-hidden p-5 sm:p-7 ${theme}`}>
        <div className="absolute -right-14 -top-16 h-64 w-64 rounded-full border border-white/35" />
        <div className="absolute -right-2 -top-5 h-48 w-48 rounded-full border border-white/25" />
        <span className="absolute left-5 top-5 text-[9px] font-bold uppercase tracking-[0.2em] sm:left-7 sm:top-7">Learn it. Build it. Keep it.</span>
        <span className="relative mt-auto font-display text-[5.5rem] font-extrabold leading-[0.8] tracking-[-0.09em] sm:text-[8rem]">SB<span className="text-[#fec430]">.</span></span>
        <span className="absolute bottom-5 right-5 max-w-24 text-right text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] sm:bottom-7 sm:right-7">Notes<br />Quizzes<br />Progress</span>
      </div>
    )
  }

  if (kind === 'library') {
    return (
      <div aria-label="Graphic cover for LibraryOS, an attendance and fee management tool" role="img" className={`relative flex aspect-[1.25] flex-col justify-between overflow-hidden p-5 sm:p-7 ${theme}`}>
        <div className="flex items-start justify-between">
          <span className="font-display text-xl font-bold tracking-[-0.06em] sm:text-2xl">LibraryOS</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Keep it moving</span>
        </div>
        <div className="relative flex items-end justify-between">
          <span className="font-display text-[5rem] font-extrabold leading-[0.82] tracking-[-0.095em] sm:text-[7rem]">300<span className="text-[#d24b3e]">+</span></span>
          <span className="mb-1 max-w-20 text-right text-[10px] font-semibold uppercase leading-4 tracking-[0.08em]">Members<br />in view</span>
        </div>
        <div className="absolute bottom-[36%] left-5 h-[1px] w-[62%] bg-[#121212]/35 sm:left-7" />
      </div>
    )
  }

  return (
    <div aria-label="Graphic cover for Crumb and Confetti, a cafe and bakery booking concept" role="img" className={`relative flex aspect-[1.25] flex-col justify-between overflow-hidden p-5 sm:p-7 ${theme}`}>
      <span className="text-[9px] font-bold uppercase tracking-[0.2em]">A good table, waiting.</span>
      <div className="relative flex items-end justify-between gap-3">
        <span className="max-w-[8ch] font-display text-[3.5rem] font-extrabold leading-[0.8] tracking-[-0.08em] sm:text-[5rem]">Crumb<br /><span className="text-[#f8f6f1]">&</span><br />Confetti</span>
        <span aria-hidden="true" className="mb-1 grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-[#121212] text-xl font-bold sm:h-24 sm:w-24 sm:text-3xl">C<br />&<br />C</span>
      </div>
    </div>
  )
}

export default function GithubProjects() {
  const reducedMotion = useReducedMotion()

  return (
    <section className="bg-[#f8f6f1] py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col gap-6 border-b border-[#121212]/20 pb-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-[-0.055em] sm:text-6xl">On the workbench</h2>
            <p className="mt-3 text-sm text-[#5d6673]">Things I’m learning by making.</p>
          </div>
          <a href="https://github.com/Yatin-x017" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#121212] underline decoration-[#d24b3e] decoration-2 underline-offset-4">
            More on GitHub<ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-x-7 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <motion.article key={project.name} initial={false} whileHover={reducedMotion ? undefined : { y: -4 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="group min-w-0">
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b44]" aria-label={`${project.name} on GitHub`}>
                <ProjectArtwork kind={project.art} theme={project.theme} />
              </a>
              <div className="flex items-start justify-between gap-5 border-b border-[#121212]/20 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#727988]">{project.discipline}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.045em] text-[#121212]">{project.name}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#555f6f]">{project.description}</p>
                </div>
                <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} repository`} className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#121212]/25 text-[#121212] transition-colors hover:border-[#d24b3e] hover:bg-[#d24b3e]">
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
