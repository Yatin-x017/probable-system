-- ============================================================================
-- 0004_project_video.sql
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Adds a `video_url` column to `projects` (for the case-study intro reel on
-- /work/:slug) and a `project-videos` storage bucket for the admin uploader.
--
-- Safe to re-run.
-- ============================================================================

alter table public.projects
  add column if not exists video_url text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('project-videos', 'project-videos', true, 209715200) -- 200MB
on conflict (id) do nothing;

drop policy if exists "project_videos_bucket_public_read" on storage.objects;
create policy "project_videos_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'project-videos');

drop policy if exists "project_videos_bucket_admin_write" on storage.objects;
create policy "project_videos_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'project-videos' and auth.role() = 'authenticated');

drop policy if exists "project_videos_bucket_admin_update" on storage.objects;
create policy "project_videos_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'project-videos' and auth.role() = 'authenticated');

drop policy if exists "project_videos_bucket_admin_delete" on storage.objects;
create policy "project_videos_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'project-videos' and auth.role() = 'authenticated');
