import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { springs } from '@/lib/motion'

export interface LegalTable {
  headers: string[]
  rows: string[][]
}

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  table?: LegalTable
}

interface LegalPageLayoutProps {
  title: string
  effectiveDate: string
  intro?: string
  sections: LegalSection[]
  /** Optional interactive content rendered between the intro and the sections list. */
  children?: ReactNode
}

function Table({ table }: { table: LegalTable }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-2.5 font-semibold text-gray-900 border-b border-gray-100 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-gray-50/50' : undefined}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-gray-600 align-top border-b border-gray-50 last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function LegalPageLayout({
  title,
  effectiveDate,
  intro,
  sections,
  children,
}: LegalPageLayoutProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.smooth}
        >
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-sm text-gray-500">Effective Date: {effectiveDate}</p>

          {intro && (
            <p className="mt-6 text-base leading-relaxed text-gray-600">{intro}</p>
          )}

          {children && <div className="mt-8">{children}</div>}

          <div className="mt-10 space-y-10">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-lg font-semibold text-gray-900">{section.heading}</h2>
                {section.paragraphs?.map((para, j) => (
                  <p key={j} className="mt-3 text-[15px] leading-relaxed text-gray-600">
                    {para}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 space-y-2 list-disc list-outside pl-5">
                    {section.bullets.map((item, j) => (
                      <li key={j} className="text-[15px] leading-relaxed text-gray-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.table && <Table table={section.table} />}
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
