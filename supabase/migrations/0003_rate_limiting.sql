-- ============================================================================
-- 0003_rate_limiting.sql
-- ----------------------------------------------------------------------------
-- Rate limiting for the two public "with check (true)" insert endpoints:
-- contact_messages and bookings. Both currently accept unlimited anonymous
-- writes from anyone holding the anon key (which ships in the client bundle),
-- so this is enforced here, in the database, rather than in React —
-- client-side throttling only stops the UI, not someone calling the
-- PostgREST endpoint directly.
-- ============================================================================

-- Column to record which IP a submission came from, so repeated abuse from
-- the same visitor is caught even if they change the email address on each
-- submission. Populated by the trigger below, not by the client — the
-- trigger overwrites whatever (if anything) the client sends for this column,
-- so it can't be spoofed by passing a fake client_ip in the insert payload.
alter table public.contact_messages add column if not exists client_ip text;
alter table public.bookings add column if not exists client_ip text;

-- Supabase's edge sets x-forwarded-for on every Data API request, and
-- PostgREST exposes request headers via current_setting('request.headers').
-- Returns null (rather than erroring) when unavailable, e.g. when a query
-- runs from the SQL editor instead of over the API.
create or replace function public.request_ip()
returns text
language sql
stable
as $$
  select nullif(
    split_part(
      coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''),
      ',', 1
    ),
    ''
  )
$$;

-- Shared trigger for both tables. Blocks the insert with HTTP 429 if the
-- same email or the same IP has already submitted max_per_window times
-- within window_minutes. security definer is required here: without it,
-- this function's internal SELECT would run as `anon`, which is blocked by
-- the tables' own "admin only" read policies, so the count would always be
-- 0 and the limit would never trigger.
create or replace function public.enforce_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
  client_ip text := public.request_ip();
  max_per_window constant integer := 3;
  window_minutes constant integer := 10;
begin
  new.client_ip := client_ip;

  execute format(
    'select count(*) from public.%I
       where created_at > now() - interval ''%s minutes''
         and (email = $1 or ($2 is not null and client_ip = $2))',
    TG_TABLE_NAME,
    window_minutes
  )
  into recent_count
  using new.email, client_ip;

  if recent_count >= max_per_window then
    raise sqlstate 'PT429'
      using message = 'Too many submissions from you recently. Please wait a few minutes and try again.',
            detail = format('rate limit: %s per %s minutes', max_per_window, window_minutes);
  end if;

  return new;
end;
$$;

drop trigger if exists contact_messages_rate_limit on public.contact_messages;
create trigger contact_messages_rate_limit
  before insert on public.contact_messages
  for each row execute function public.enforce_submission_rate_limit();

drop trigger if exists bookings_rate_limit on public.bookings;
create trigger bookings_rate_limit
  before insert on public.bookings
  for each row execute function public.enforce_submission_rate_limit();

-- Supports the trigger's per-IP lookup efficiently on both tables.
create index if not exists contact_messages_client_ip_idx on public.contact_messages (client_ip, created_at desc);
create index if not exists bookings_client_ip_idx on public.bookings (client_ip, created_at desc);
