import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from './client'

// The AI tables aren't in the generated Database type, so use an untyped client here.
const db = supabase as unknown as SupabaseClient

export type AISettings = {
  enabled: boolean
  mode: 'draft' | 'auto'
  model: string
  min_gap_days: number
  voice_guide: string
  writing_samples: string
  raw_notes: string
  topic_queue: string[]
}

export type AIRun = {
  id: string
  created_at: string
  trigger: 'manual' | 'cron'
  topic: string | null
  post_id: string | null
  model: string | null
  prompt_tokens: number | null
  completion_tokens: number | null
  status: 'success' | 'error'
  error: string | null
}

export type GeneratedPost = {
  title: string
  slug: string
  excerpt: string
  content: string
}

export const AI_SETTINGS_DEFAULTS: AISettings = {
  enabled: false,
  mode: 'draft',
  model: 'openai/gpt-oss-120b',
  min_gap_days: 2,
  voice_guide:
    'Plain, direct, first person. Short sentences. Practical over theoretical. No hype, no filler.',
  writing_samples: '',
  raw_notes: '',
  topic_queue: [],
}

export async function getAISettings(): Promise<AISettings> {
  const { data, error } = await db.from('ai_settings').select('*').eq('id', 'main').maybeSingle()
  if (error) throw error
  return { ...AI_SETTINGS_DEFAULTS, ...(data ?? {}) } as AISettings
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  const { error } = await db.from('ai_settings').upsert({
    id: 'main',
    ...settings,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function getAIRuns(limit = 15): Promise<AIRun[]> {
  const { data, error } = await db
    .from('ai_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as AIRun[]
}

export async function generatePost(opts: {
  topic?: string
  notes?: string
  save?: boolean
}): Promise<{ post: GeneratedPost; saved: boolean; post_id: string | null }> {
  const { data, error } = await supabase.functions.invoke('ai-generate-post', { body: opts })
  if (error) {
    let message = error.message
    try {
      const body = await (error as unknown as { context?: Response }).context?.json()
      if (body?.error) message = body.error
    } catch {
      /* keep default message */
    }
    throw new Error(message)
  }
  return data
}
