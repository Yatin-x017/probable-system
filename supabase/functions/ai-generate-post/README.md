# ai-generate-post

Generates blog posts with Groq, grounded in your published projects + the notes you keep in Admin -> AI.

## Setup

1. Run `supabase/migrations/0005_ai.sql` in the Supabase SQL Editor.
2. Get a key at https://console.groq.com and set secrets:

```bash
supabase secrets set GROQ_API_KEY="gsk_..."
supabase secrets set CRON_SECRET="$(openssl rand -hex 32)"
```

3. Deploy (no JWT gateway check, the function authenticates callers itself):

```bash
supabase functions deploy ai-generate-post --no-verify-jwt
```

4. In Supabase Auth settings, make sure public sign-ups are disabled. Admin RLS in this
   project is "any authenticated user", so only you should be able to hold an account.

## Test

Admin -> AI -> "Generate draft now". A draft appears in Admin -> Blog and the run is logged.
