-- ============================================================================
-- ai-schedule.sql  (Phase 2: automatic posting)
-- Run ONCE in Supabase Dashboard -> SQL Editor.
--
-- 1. Replace YOUR_PROJECT_REF below (the part before .supabase.co).
-- 2. Replace YOUR_CRON_SECRET with the exact CRON_SECRET you set with
--    `supabase secrets set CRON_SECRET=...`.
-- 3. Run it. Do NOT commit this file with real values filled in.
--
-- It calls the ai-generate-post function once a day at 04:00 UTC (09:30 IST).
-- The function itself skips the run unless ai_settings.enabled is true and
-- at least min_gap_days have passed since the last AI post, so "every two
-- days" is controlled from Admin -> AI, not here.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Store the URL + secret in Vault so they aren't visible in the cron job text.
delete from vault.secrets where name in ('ai_project_url', 'ai_cron_secret');
select vault.create_secret('https://srfkalagzzzehtxqvcze.supabase.co', 'ai_project_url');
select vault.create_secret('18b3a515d4f58846dc78b86ef45f9193a817fcfbda1c4ccc646a8788f6007311', 'ai_cron_secret');

-- Replace any previous schedule with the same name.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'ai-generate-post-daily') then
    perform cron.unschedule('ai-generate-post-daily');
  end if;
end $$;

select cron.schedule(
  'ai-generate-post-daily',
  '0 4 * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'ai_project_url')
           || '/functions/v1/ai-generate-post',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ai_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $job$
);

-- ---------------------------------------------------------------------------
-- Handy checks (run separately):
--   select * from cron.job;                                             -- is it scheduled?
--   select * from cron.job_run_details order by start_time desc limit 5; -- did it fire?
--   select * from net._http_response order by created desc limit 5;     -- what did the function answer?
--   select cron.unschedule('ai-generate-post-daily');                   -- turn the schedule off entirely
-- ---------------------------------------------------------------------------
