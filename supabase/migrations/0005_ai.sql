-- ============================================================================
-- 0005_ai.sql
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- AI blog automation (Groq). Adds:
--   ai_settings  - single row ('main') of admin-editable AI config
--   ai_runs      - audit log of every generation (manual or scheduled)
--   blog_posts.ai_generated - marks posts created by the AI
-- Safe to re-run.
-- ============================================================================

alter table public.blog_posts add column if not exists ai_generated boolean default false;

-- ----------------------------------------------------------------------------
-- ai_settings
-- ----------------------------------------------------------------------------
create table if not exists public.ai_settings (
  id text primary key default 'main',
  enabled boolean not null default false,          -- scheduled posting on/off
  mode text not null default 'draft',              -- draft | auto (auto = publish scheduled posts)
  model text not null default 'openai/gpt-oss-120b',
  min_gap_days integer not null default 2,         -- minimum days between scheduled posts
  voice_guide text not null default 'Plain, direct, first person. Short sentences. Practical over theoretical. No hype, no filler.',
  writing_samples text not null default '',        -- paste a few of your own writing samples
  raw_notes text not null default '',              -- what you actually did/learned lately (only source of first-person claims)
  topic_queue text[] not null default '{}',        -- topics to write about, used in order
  updated_at timestamptz default now()
);

alter table public.ai_settings enable row level security;

drop policy if exists "ai_settings_admin_all" on public.ai_settings;
create policy "ai_settings_admin_all"
  on public.ai_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into public.ai_settings (id) values ('main') on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- ai_runs  (written by the Edge Function with the service role)
-- ----------------------------------------------------------------------------
create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  trigger text not null default 'manual',          -- manual | cron
  topic text,
  post_id uuid references public.blog_posts (id) on delete set null,
  model text,
  prompt_tokens integer,
  completion_tokens integer,
  status text not null default 'success',          -- success | error
  error text
);

alter table public.ai_runs enable row level security;

drop policy if exists "ai_runs_admin_read" on public.ai_runs;
create policy "ai_runs_admin_read"
  on public.ai_runs for select
  using (auth.role() = 'authenticated');

drop policy if exists "ai_runs_admin_delete" on public.ai_runs;
create policy "ai_runs_admin_delete"
  on public.ai_runs for delete
  using (auth.role() = 'authenticated');

create index if not exists ai_runs_created_at_idx on public.ai_runs (created_at desc);

-- touch updated_at on settings
drop trigger if exists ai_settings_touch_updated_at on public.ai_settings;
create trigger ai_settings_touch_updated_at
  before update on public.ai_settings
  for each row execute function public.touch_updated_at();
