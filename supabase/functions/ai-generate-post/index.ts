// Supabase Edge Function: ai-generate-post
//
// Generates a blog post with the Groq API, grounded in your projects + notes.
//
// Callers:
//   - Admin UI (logged-in user JWT)  -> manual. Returns the post; saves only if body.save === true (always as draft).
//   - Scheduler (x-cron-secret header) -> cron. Respects ai_settings.enabled + min_gap_days, always saves,
//     publishes only if ai_settings.mode === 'auto'.
//
// Secrets (supabase secrets set NAME=value):
//   GROQ_API_KEY   - from console.groq.com
//   CRON_SECRET    - any long random string (used by the scheduler in phase 2)
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// Deploy with --no-verify-jwt (this function does its own auth, so the
// scheduler can call it with only the secret header):
//   supabase functions deploy ai-generate-post --no-verify-jwt

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// The blog renders light Markdown, one line per paragraph. Normalise to
// single newlines between blocks and demote any "# " title to "## ".
function normaliseContent(raw: string): string {
  return raw
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim().replace(/^#\s+/, '## '))
    .filter(Boolean)
    .join('\n')
}

function parseModelJson(text: string): Record<string, unknown> {
  const clean = text.replace(/```json|```/g, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Model did not return JSON')
  return JSON.parse(clean.slice(start, end + 1))
}

const SYSTEM_PROMPT = `You ghostwrite blog posts for a personal portfolio site, in the first person, as the site owner.

HARD RULES
1. Anything about the owner's own experiences, projects, clients, results, numbers or opinions must come ONLY from the PROJECTS and NOTES provided. Never invent anecdotes, clients, metrics, quotes, dates or events. If the notes are thin, write an explainer or opinion piece from general technical knowledge with no invented personal claims.
2. Technical content must be accurate. Do not invent library APIs, flags or statistics.
3. Do not repeat or closely overlap the RECENT TITLES.
4. Follow the VOICE GUIDE and imitate the WRITING SAMPLES' tone if provided.
5. Avoid AI cliches: no "in today's fast-paced world", "delve", "game-changer", "unlock", "landscape", "tapestry".
6. Length: 500 to 800 words.
7. Format: light Markdown only. Separate paragraphs with a single newline (no blank lines). You may use "## " subheadings (2 to 4 per post), "- " bullet lines, **bold** sparingly. No inline code, tables, images or code fences. Do not repeat the title inside the content.

OUTPUT
Return ONLY a JSON object, no preamble, no code fences:
{"title": string, "slug": string (lowercase-hyphenated), "excerpt": string (1-2 sentences, max 200 chars), "content": string}`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const groqKey = Deno.env.get('GROQ_API_KEY')
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (!groqKey) return json({ error: 'GROQ_API_KEY secret is not set on the Edge Function' }, 500)

  const admin = createClient(url, serviceKey)

  // ---- auth ----
  let trigger: 'manual' | 'cron' = 'manual'
  const secretHeader = req.headers.get('x-cron-secret')
  if (secretHeader) {
    if (!cronSecret || secretHeader !== cronSecret) return json({ error: 'Unauthorized' }, 401)
    trigger = 'cron'
  } else {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data, error } = await admin.auth.getUser(token)
    if (error || !data.user) return json({ error: 'Unauthorized' }, 401)
  }

  const body = await req.json().catch(() => ({}))
  const save: boolean = trigger === 'cron' ? true : body.save === true

  // ---- settings ----
  const { data: settings } = await admin.from('ai_settings').select('*').eq('id', 'main').maybeSingle()
  const s = {
    enabled: false,
    mode: 'draft',
    model: 'openai/gpt-oss-120b',
    min_gap_days: 2,
    voice_guide: '',
    writing_samples: '',
    raw_notes: '',
    topic_queue: [] as string[],
    ...(settings ?? {}),
  }

  // ---- scheduler gating ----
  if (trigger === 'cron') {
    if (!s.enabled) return json({ status: 'skipped', reason: 'disabled' })
    const { data: last } = await admin
      .from('blog_posts')
      .select('created_at')
      .eq('ai_generated', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (last?.created_at) {
      const gapMs = s.min_gap_days * 24 * 3600 * 1000 - 2 * 3600 * 1000 // 2h tolerance
      if (Date.now() - new Date(last.created_at).getTime() < gapMs) {
        return json({ status: 'skipped', reason: 'too_soon' })
      }
    }
  }

  // ---- topic ----
  let topic = String(body.topic ?? '').trim()
  let fromQueue = false
  if (!topic && s.topic_queue.length > 0) {
    topic = s.topic_queue[0]
    fromQueue = true
  }
  const notes = String(body.notes ?? '').trim() || s.raw_notes

  let postId: string | null = null
  let promptTokens: number | null = null
  let completionTokens: number | null = null

  try {
    // ---- context ----
    const [{ data: projects }, { data: posts }] = await Promise.all([
      admin
        .from('projects')
        .select('title, summary, role, tech_stack, problem, process, outcome')
        .eq('published', true)
        .order('sort_order')
        .limit(8),
      admin.from('blog_posts').select('title').order('created_at', { ascending: false }).limit(20),
    ])

    const userPrompt = [
      topic
        ? `TOPIC: ${topic}`
        : 'TOPIC: Choose a topic that fits the owner\'s work (see PROJECTS and NOTES) and has not been covered in RECENT TITLES.',
      `VOICE GUIDE:\n${s.voice_guide || '(none)'}`,
      `WRITING SAMPLES:\n${s.writing_samples || '(none)'}`,
      `PROJECTS (published work, the only source of project facts):\n${JSON.stringify(projects ?? [])}`,
      `NOTES (what the owner actually did or learned lately):\n${notes || '(none)'}`,
      `RECENT TITLES (do not repeat):\n${(posts ?? []).map((p: { title: string }) => `- ${p.title}`).join('\n') || '(none)'}`,
      'Write the post now. Respond with the JSON object only.',
    ].join('\n\n')

    const payload: Record<string, unknown> = {
      model: s.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 4000,
      response_format: { type: 'json_object' },
    }
    if (String(s.model).startsWith('openai/gpt-oss')) payload.reasoning_effort = 'low'

    const callGroq = (p: Record<string, unknown>) =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      })

    let res = await callGroq(payload)
    if (res.status === 400) {
      // Some models reject response_format; retry once without it (prompt already demands JSON).
      const { response_format: _rf, ...rest } = payload
      res = await callGroq(rest)
    }
    if (!res.ok) {
      const t = await res.text()
      throw new Error(`Groq API ${res.status}: ${t.slice(0, 300)}`)
    }

    const data = await res.json()
    promptTokens = data.usage?.prompt_tokens ?? null
    completionTokens = data.usage?.completion_tokens ?? null

    const parsed = parseModelJson(data.choices?.[0]?.message?.content ?? '')
    const title = String(parsed.title ?? '').trim()
    const excerpt = String(parsed.excerpt ?? '').trim()
    const content = normaliseContent(String(parsed.content ?? ''))
    if (!title || content.length < 300) throw new Error('Model returned an empty or too-short post')

    let slug = slugify(String(parsed.slug || title))
    const { data: clash } = await admin.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

    // ---- save ----
    let published = false
    if (save) {
      published = trigger === 'cron' && s.mode === 'auto'
      const { data: inserted, error: insErr } = await admin
        .from('blog_posts')
        .insert({
          slug,
          title,
          excerpt: excerpt || null,
          content,
          published,
          published_at: published ? new Date().toISOString() : null,
          ai_generated: true,
        })
        .select('id')
        .single()
      if (insErr) throw new Error(`Saving post failed: ${insErr.message}`)
      postId = inserted.id

      if (fromQueue) {
        await admin.from('ai_settings').update({ topic_queue: s.topic_queue.slice(1) }).eq('id', 'main')
      }
    }

    await admin.from('ai_runs').insert({
      trigger,
      topic: topic || title,
      post_id: postId,
      model: s.model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      status: 'success',
    })

    return json({
      status: 'success',
      saved: save,
      published,
      post_id: postId,
      post: { title, slug, excerpt, content },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await admin.from('ai_runs').insert({
      trigger,
      topic: topic || null,
      model: s.model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      status: 'error',
      error: message.slice(0, 500),
    })
    return json({ status: 'error', error: message }, 500)
  }
})
