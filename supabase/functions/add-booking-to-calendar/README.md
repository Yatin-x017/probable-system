# add-booking-to-calendar

Auto-creates an event on **your** Google Calendar whenever someone books a
call. Everything below is free (Google Calendar API's free quota is far
higher than a personal booking site will ever use; Supabase Edge Functions
have a generous free tier too).

## 1. Create a Google service account

1. Go to https://console.cloud.google.com/ and create a project (or reuse one).
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **APIs & Services → Credentials → Create Credentials → Service account**.
   Give it any name (e.g. `booking-bot`).
4. Open the new service account → **Keys → Add Key → Create new key → JSON**.
   This downloads a `.json` file — keep it private, never commit it.
5. Note the `client_email` and `private_key` fields inside that JSON file.

## 2. Share your calendar with the service account

1. Open Google Calendar → your calendar's **Settings and sharing**.
2. Under **Share with specific people**, add the service account's email
   (the `client_email` from step 1) with **"Make changes to events"** permission.
3. Scroll to **Integrate calendar** and copy the **Calendar ID** (for your
   primary calendar this is usually just your Gmail address).

## 3. Set the Edge Function secrets

```bash
supabase secrets set GOOGLE_CLIENT_EMAIL="booking-bot@your-project.iam.gserviceaccount.com"
supabase secrets set GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...paste the full key, keep the newlines...
-----END PRIVATE KEY-----"
supabase secrets set GOOGLE_CALENDAR_ID="you@gmail.com"
```

(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically —
you don't set those.)

## 4. Deploy the function

```bash
supabase functions deploy add-booking-to-calendar
```

## 5. Wire it up with a Database Webhook

In the Supabase dashboard: **Database → Webhooks → Create a new webhook**.

- Table: `bookings`
- Events: `INSERT`
- Type: `Supabase Edge Functions`
- Function: `add-booking-to-calendar`

That's it — every new row in `bookings` now triggers the function, which
creates the calendar event and writes the resulting `google_event_id` back
onto the row.

## Notes

- This uses a **service account**, not your personal Google login, so the
  event is created *by* the bot but lives on the calendar you shared in
  step 2 — functionally the same as you creating it yourself.
- Visitors also get a plain "Add to Google Calendar" link on the confirmation
  screen for their own calendar — that part needs no setup at all, see
  `src/lib/googleCalendarLink.ts`.
- If this webhook fails (e.g. secrets not set yet), the booking itself still
  succeeds — this is a best-effort sync, not a blocking step.
