import { supabase } from './client'
import { CONTENT_DEFAULTS, type ContentKey } from '@/lib/content/defaults'

// Generic reader — merges the saved row (if any) on top of the hardcoded
// default so new fields added later never break old saved content, and the
// site never shows blank text before the admin has saved anything.
export async function getSiteContent<K extends ContentKey>(
  key: K
): Promise<(typeof CONTENT_DEFAULTS)[K]> {
  const fallback = CONTENT_DEFAULTS[key]
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('id', key)
    .single()

  if (error || !data) return fallback
  const row = data as unknown as { content: Record<string, unknown> }
  return { ...fallback, ...row.content } as (typeof CONTENT_DEFAULTS)[K]
}

// Admin writer — upserts the whole JSON blob for a section.
export async function saveSiteContent<K extends ContentKey>(
  key: K,
  content: (typeof CONTENT_DEFAULTS)[K]
): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    // @ts-ignore - generic JSON column, typed narrowly at call sites instead
    .upsert({ id: key, content, updated_at: new Date().toISOString() })

  if (error) throw error
}

// Image upload for content sections (portraits, teaser images, etc).
// Reuses the same public-bucket pattern as project/blog image uploads.
export async function uploadContentImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('site-content').upload(path, file, {
    upsert: true,
  })
  if (error) throw error
  const { data } = supabase.storage.from('site-content').getPublicUrl(path)
  return data.publicUrl
}
