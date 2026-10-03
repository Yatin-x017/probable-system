import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!envUrl || !envKey) {
  // createClient() throws on an empty URL, which used to crash the whole app
  // before React mounted and left the initial loading dots on screen forever.
  // Fall back to placeholders so the UI still renders (data calls will just
  // fail and show empty states) and tell the developer what's missing.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. ' +
      'Copy .env.example to .env, fill them in, and restart `npm run dev`.'
  )
}

const supabaseUrl = envUrl || 'http://localhost:54321'
const supabaseAnonKey = envKey || 'missing-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Admin auth helper
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
