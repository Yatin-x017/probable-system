import { supabase } from './client'
import type { Database } from '@/types/supabase'

// Type aliases
type Project = Database['public']['Tables']['projects']['Row']
type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
type Booking = Database['public']['Tables']['bookings']['Row']
type Payment = Database['public']['Tables']['payments']['Row']
type ProjectImage = Database['public']['Tables']['project_images']['Row']

// The contact_messages/bookings insert triggers raise `sqlstate 'PT429'`
// (see supabase/migrations/0003_rate_limiting.sql) when the same email or IP
// has submitted too many times recently. supabase-js surfaces that as
// error.code === 'PT429'. Use this in form catch blocks so the person sees
// the actual reason instead of a generic "something went wrong".
export function friendlySubmissionError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'PT429') {
    return "You've submitted a few of these already — please wait a few minutes before trying again."
  }
  return 'Something went wrong. Please try again.'
}

// ==================== PUBLIC API (no auth required) ====================

// Projects
export async function getPublishedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .returns<Project[]>()

  if (error) throw error
  return data || []
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .returns<Project[]>()

  if (error) throw error
  return data || []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Project | null
}

export async function getProjectImages(projectId: string): Promise<ProjectImage[]> {
  const { data, error } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .returns<ProjectImage[]>()

  if (error) throw error
  return data || []
}

// Blog Posts
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .returns<BlogPost[]>()

  if (error) throw error
  return data || []
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as BlogPost | null
}

// Contact
export async function submitContactMessage(
  name: string,
  email: string,
  message: string
): Promise<void> {
  const { error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, message }] as any)

  if (error) throw error
}

// Bookings
export async function createBooking(
  name: string,
  email: string,
  startsAt: string,
  endsAt: string,
  purpose?: string
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      name,
      email,
      purpose: purpose || null,
      starts_at: startsAt,
      ends_at: endsAt,
      status: 'confirmed',
    }] as any)
    .select()
    .single()

  if (error) throw error
  return data as Booking
}

// ==================== ADMIN API (auth required) ====================

// Admin profile
export async function getAdminProfile(
  userId: string
): Promise<Database['public']['Tables']['admin_profile']['Row'] | null> {
  const { data, error } = await supabase
    .from('admin_profile')
    .select('*')
    .eq('id', userId)
    .single()

  // PGRST116 = no row found — not a real error, just no profile row yet
  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null
  return data as Database['public']['Tables']['admin_profile']['Row']
}

// Projects CRUD
export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .returns<Project[]>()

  if (error) throw error
  return data || []
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Project | null
}

export async function createProject(project: Record<string, any>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    // @ts-ignore
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, project: Record<string, any>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    // @ts-ignore
    .update(project)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Project Images CRUD
export async function addProjectImage(image: Record<string, any>): Promise<ProjectImage> {
  const { data, error } = await supabase
    .from('project_images')
    .insert(image as any)
    .select()
    .single()

  if (error) throw error
  return data as ProjectImage
}

export async function deleteProjectImage(id: string): Promise<void> {
  const { error } = await supabase
    .from('project_images')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Blog CRUD
export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<BlogPost[]>()

  if (error) throw error
  return data || []
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as BlogPost | null
}

export async function createPost(post: Record<string, any>): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post as any)
    .select()
    .single()

  if (error) throw error
  return data as BlogPost
}

export async function updatePost(id: string, post: Record<string, any>): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    // @ts-ignore
    .update(post)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as BlogPost
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Messages (admin only)
export async function getAllMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<ContactMessage[]>()

  if (error) throw error
  return data || []
}

export async function markMessageAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('contact_messages')
    // @ts-ignore
    .update({ read: true })
    .eq('id', id)

  if (error) throw error
}

// Bookings (admin only)
export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('starts_at', { ascending: false })
    .returns<Booking[]>()

  if (error) throw error
  return data || []
}

// Payments CRUD
export async function getAllPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, projects(title)')
    .order('created_at', { ascending: false })
    .returns<Payment[]>()

  if (error) throw error
  return data || []
}

export async function createPayment(payment: Record<string, any>): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment as any)
    .select()
    .single()

  if (error) throw error
  return data as Payment
}

export async function updatePayment(id: string, payment: Record<string, any>): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    // @ts-ignore
    .update(payment)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Payment
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Storage
// Supabase storage keys reject spaces and most punctuation (colons, @, etc).
// Sanitize just the filename segment so paths like
// "covers/171-Screenshot 2026-07-15 at 1.57.19 PM.png" don't 400/406.
function sanitizeStorageFilename(name: string): string {
  const lastDot = name.lastIndexOf('.')
  const base = lastDot > 0 ? name.slice(0, lastDot) : name
  const ext = lastDot > 0 ? name.slice(lastDot) : ''
  const safeBase = base
    .normalize('NFKD')
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${safeBase || 'file'}${ext.replace(/[^\w.]+/g, '')}`
}

export async function uploadImage(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const segments = path.split('/')
  segments[segments.length - 1] = sanitizeStorageFilename(segments[segments.length - 1])
  const safePath = segments.join('/')

  const { error } = await supabase.storage
    .from(bucket)
    .upload(safePath, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(safePath)
  return data.publicUrl
}
