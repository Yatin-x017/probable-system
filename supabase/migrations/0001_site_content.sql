-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- Adds a generic `site_content` table that powers the new /admin/content
-- CMS screen, so text on Home / About / Contact / Navbar / Footer is no
-- longer hardcoded in the React source. Also creates the public storage
-- bucket used for images uploaded from that screen (portrait, teaser image,
-- etc).

-- 1. Table: one row per editable section, content stored as JSON.
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.site_content enable row level security;

-- Anyone (including anonymous visitors) can read content — it's public
-- website copy.
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
  on public.site_content for select
  using (true);

-- Only logged-in admins can create/update/delete content.
drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write"
  on public.site_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2. Storage bucket for CMS images (portraits, teaser photos, etc).
insert into storage.buckets (id, name, public)
values ('site-content', 'site-content', true)
on conflict (id) do nothing;

drop policy if exists "site_content_bucket_public_read" on storage.objects;
create policy "site_content_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'site-content');

drop policy if exists "site_content_bucket_admin_write" on storage.objects;
create policy "site_content_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'site-content' and auth.role() = 'authenticated');

drop policy if exists "site_content_bucket_admin_update" on storage.objects;
create policy "site_content_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'site-content' and auth.role() = 'authenticated');

drop policy if exists "site_content_bucket_admin_delete" on storage.objects;
create policy "site_content_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'site-content' and auth.role() = 'authenticated');
