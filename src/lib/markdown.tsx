import type { ReactNode } from 'react'

// Small, dependency-free Markdown renderer for blog posts. It renders React
// elements (never raw HTML), so post content can't inject markup.
//
// Backwards compatible with the old plain-text posts: every non-empty line is
// its own paragraph unless it is a heading, list item, quote or code fence.

function safeHref(url: string): string | null {
  const u = url.trim()
  if (/^(https?:\/\/|mailto:)/i.test(u) || u.startsWith('/') || u.startsWith('#')) return u
  return null
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/g
  let last = 0
  let i = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `${keyPrefix}-${i++}`
    if (m[1]) {
      out.push(
        <code key={key} className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.9em] text-gray-800">
          {tok.slice(1, -1)}
        </code>
      )
    } else if (m[2]) {
      out.push(
        <strong key={key} className="font-semibold text-gray-900">
          {renderInline(tok.slice(2, -2), key)}
        </strong>
      )
    } else if (m[3]) {
      out.push(<em key={key}>{renderInline(tok.slice(1, -1), key)}</em>)
    } else {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok)
      const href = lm ? safeHref(lm[2]) : null
      if (lm && href) {
        const external = /^https?:\/\//i.test(href)
        out.push(
          <a
            key={key}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="text-gray-900 underline underline-offset-2 hover:text-gray-600"
          >
            {lm[1]}
          </a>
        )
      } else {
        out.push(lm ? lm[1] : tok)
      }
    }
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

const BULLET = /^\s*[-*]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n')
  const nodes: ReactNode[] = []
  let i = 0
  let k = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    // fenced code block
    if (line.trim().startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i++
      }
      i++ // closing fence
      nodes.push(
        <pre
          key={k++}
          className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100"
        >
          <code>{code.join('\n')}</code>
        </pre>
      )
      continue
    }

    // headings (# is demoted to h2 because the page title is the h1)
    const h = /^(#{1,3})\s+(.*)$/.exec(line)
    if (h) {
      const level = h[1].length
      const content = renderInline(h[2], `h${k}`)
      nodes.push(
        level === 3 ? (
          <h3 key={k++} className="mt-6 mb-2 text-lg font-semibold text-gray-900">
            {content}
          </h3>
        ) : (
          <h2 key={k++} className="mt-8 mb-3 text-xl font-semibold text-gray-900">
            {content}
          </h2>
        )
      )
      i++
      continue
    }

    // bullet list
    if (BULLET.test(line)) {
      const items: string[] = []
      while (i < lines.length && BULLET.test(lines[i])) {
        items.push(BULLET.exec(lines[i])![1])
        i++
      }
      nodes.push(
        <ul key={k++} className="mb-4 list-disc space-y-1 pl-6 text-gray-600">
          {items.map((it, n) => (
            <li key={n} className="leading-relaxed">
              {renderInline(it, `ul${k}-${n}`)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // numbered list
    if (NUMBERED.test(line)) {
      const items: string[] = []
      while (i < lines.length && NUMBERED.test(lines[i])) {
        items.push(NUMBERED.exec(lines[i])![1])
        i++
      }
      nodes.push(
        <ol key={k++} className="mb-4 list-decimal space-y-1 pl-6 text-gray-600">
          {items.map((it, n) => (
            <li key={n} className="leading-relaxed">
              {renderInline(it, `ol${k}-${n}`)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // blockquote
    if (line.startsWith('>')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        quote.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      nodes.push(
        <blockquote
          key={k++}
          className="mb-4 border-l-4 border-gray-200 pl-4 italic text-gray-500"
        >
          {renderInline(quote.join(' '), `bq${k}`)}
        </blockquote>
      )
      continue
    }

    // paragraph (one line = one paragraph, same as the old plain-text renderer)
    nodes.push(
      <p key={k++} className="mb-4 leading-relaxed text-gray-600">
        {renderInline(line, `p${k}`)}
      </p>
    )
    i++
  }

  return <div className="max-w-none">{nodes}</div>
}
