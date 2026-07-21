-- ============================================================================
-- 0002_core_schema.sql
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- 0001_site_content.sql already created `site_content`. This migration adds
-- every other table the app's src/lib/supabase/api.ts already calls:
--   projects, project_images, blog_posts, contact_messages, bookings,
--   payments, admin_profile
-- plus the two storage buckets used by the admin editors
-- (`project-images`, `blog-images`).
--
-- Safe to re-run: every statement is idempotent (if not exists / drop+create
-- policy), matching the style of 0001.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  title text not null,
  summary text,
  role text,
  type text[],
  cover_image_url text,
  problem text,
  process text,
  outcome text,
  tech_stack text[],
  live_url text,
  repo_url text,
  featured boolean default false,
  published boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects for select
  using (published = true);

drop policy if exists "projects_admin_read_all" on public.projects;
create policy "projects_admin_read_all"
  on public.projects for select
  using (auth.role() = 'authenticated');

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write"
  on public.projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create index if not exists projects_slug_idx on public.projects (slug);
create index if not exists projects_published_sort_idx on public.projects (published, sort_order);

-- ----------------------------------------------------------------------------
-- 2. project_images (gallery images for a case study, FK -> projects)
-- ----------------------------------------------------------------------------
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id text references public.projects (id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer default 0
);

alter table public.project_images enable row level security;

drop policy if exists "project_images_public_read" on public.project_images;
create policy "project_images_public_read"
  on public.project_images for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id and p.published = true
    )
  );

drop policy if exists "project_images_admin_read_all" on public.project_images;
create policy "project_images_admin_read_all"
  on public.project_images for select
  using (auth.role() = 'authenticated');

drop policy if exists "project_images_admin_write" on public.project_images;
create policy "project_images_admin_write"
  on public.project_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create index if not exists project_images_project_id_idx on public.project_images (project_id);

-- ----------------------------------------------------------------------------
-- 3. blog_posts
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  cover_image_url text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read"
  on public.blog_posts for select
  using (published = true);

drop policy if exists "blog_posts_admin_read_all" on public.blog_posts;
create policy "blog_posts_admin_read_all"
  on public.blog_posts for select
  using (auth.role() = 'authenticated');

drop policy if exists "blog_posts_admin_write" on public.blog_posts;
create policy "blog_posts_admin_write"
  on public.blog_posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);

-- ----------------------------------------------------------------------------
-- 4. contact_messages (from the public Contact page form)
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (including anonymous visitors) can submit a message, but nobody
-- can read/list them from the client — only the admin dashboard, which
-- authenticates as a logged-in user, can.
drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update"
  on public.contact_messages for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_admin_delete"
  on public.contact_messages for delete
  using (auth.role() = 'authenticated');

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_read_idx on public.contact_messages (read);

-- ----------------------------------------------------------------------------
-- 5. bookings (from the public /book page)
-- ----------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  purpose text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  google_event_id text,
  status text default 'pending', -- pending | confirmed | cancelled
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

-- Visitors can create a booking, but only the admin can see the schedule.
drop policy if exists "bookings_public_insert" on public.bookings;
create policy "bookings_public_insert"
  on public.bookings for insert
  with check (true);

drop policy if exists "bookings_admin_read" on public.bookings;
create policy "bookings_admin_read"
  on public.bookings for select
  using (auth.role() = 'authenticated');

drop policy if exists "bookings_admin_write" on public.bookings;
create policy "bookings_admin_write"
  on public.bookings for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "bookings_admin_delete" on public.bookings;
create policy "bookings_admin_delete"
  on public.bookings for delete
  using (auth.role() = 'authenticated');

create index if not exists bookings_starts_at_idx on public.bookings (starts_at);
create index if not exists bookings_status_idx on public.bookings (status);

-- Prevent double-booking the same slot at the DB level, not just in the UI.
create unique index if not exists bookings_unique_slot_idx
  on public.bookings (starts_at)
  where status <> 'cancelled';

-- ----------------------------------------------------------------------------
-- 6. payments (admin-only invoice/payment tracker)
-- ----------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  project_id text references public.projects (id) on delete set null,
  amount numeric(12, 2) not null,
  currency text default 'INR',
  status text default 'pending', -- pending | paid | overdue | cancelled
  invoice_note text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

-- Fully admin-only — no public policy at all.
drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all"
  on public.payments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_project_id_idx on public.payments (project_id);

-- ----------------------------------------------------------------------------
-- 7. admin_profile (single-row-per-admin settings, e.g. Google Calendar link)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_profile (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  google_calendar_connected boolean default false
);

alter table public.admin_profile enable row level security;

drop policy if exists "admin_profile_self_read" on public.admin_profile;
create policy "admin_profile_self_read"
  on public.admin_profile for select
  using (auth.uid() = id);

drop policy if exists "admin_profile_self_write" on public.admin_profile;
create policy "admin_profile_self_write"
  on public.admin_profile for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 8. Storage buckets used by the admin editors
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('project-images', 'project-images', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "project_images_bucket_public_read" on storage.objects;
create policy "project_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'project-images');

drop policy if exists "project_images_bucket_admin_write" on storage.objects;
create policy "project_images_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'project-images' and auth.role() = 'authenticated');

drop policy if exists "project_images_bucket_admin_update" on storage.objects;
create policy "project_images_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');

drop policy if exists "project_images_bucket_admin_delete" on storage.objects;
create policy "project_images_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'project-images' and auth.role() = 'authenticated');

drop policy if exists "blog_images_bucket_public_read" on storage.objects;
create policy "blog_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "blog_images_bucket_admin_write" on storage.objects;
create policy "blog_images_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and auth.role() = 'authenticated');

drop policy if exists "blog_images_bucket_admin_update" on storage.objects;
create policy "blog_images_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'blog-images' and auth.role() = 'authenticated');

drop policy if exists "blog_images_bucket_admin_delete" on storage.objects;
create policy "blog_images_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'blog-images' and auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 9. updated_at auto-touch trigger (projects, blog_posts) — the API layer
-- doesn't set updated_at on every UPDATE, so keep it accurate at the DB level.
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists blog_posts_touch_updated_at on public.blog_posts;
create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row execute function public.touch_updated_at();
