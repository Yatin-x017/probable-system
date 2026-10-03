// Supabase Edge Function: add-booking-to-calendar
//
// Triggered by a Database Webhook on INSERT into public.bookings.
// Creates an event on the owner's Google Calendar using a Google service
// account (no OAuth login flow needed — see README.md in this folder for
// one-time setup), then writes the created event id back onto the booking
// row so it can be looked up / cancelled later.
//
// Required secrets (set with `supabase secrets set NAME=value`):
//   GOOGLE_CLIENT_EMAIL   - service account email
//   GOOGLE_PRIVATE_KEY    - service account private key (PEM, keep the \n's)
//   GOOGLE_CALENDAR_ID    - calendar to write to (often your Gmail address,
//                           or a dedicated calendar's id from its settings)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically to
// every Edge Function — no need to set those yourself.

import { createClient } from 'jsr:@supabase/supabase-js@2'

interface BookingRecord {
  id: string
  name: string
  email: string
  purpose: string | null
  starts_at: string
  ends_at: string
}

interface WebhookPayload {
  type: 'INSERT'
  table: string
  record: BookingRecord
}

// ---- Google service-account JWT auth (no external deps, Deno-native) ----

function base64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const contents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const raw = atob(contents)
  const buffer = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) buffer[i] = raw.charCodeAt(i)

  return crypto.subtle.importKey(
    'pkcs8',
    buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

async function getAccessToken(): Promise<string> {
  const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')
  const privateKeyPem = Deno.env.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n')
  if (!clientEmail || !privateKeyPem) {
    throw new Error('GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY secrets are not set')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`
  const key = await importPrivateKey(privateKeyPem)
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  )
  const jwt = `${unsigned}.${base64url(signature)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  return data.access_token as string
}

async function createCalendarEvent(booking: BookingRecord, accessToken: string) {
  const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID')
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID secret is not set')

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `Call with ${booking.name}`,
        description: booking.purpose || undefined,
        start: { dateTime: booking.starts_at },
        end: { dateTime: booking.ends_at },
        attendees: [{ email: booking.email }],
        // No Google Meet/OAuth-user context in a service-account-only setup,
        // so we skip conferenceData here. Add it if you set up domain-wide
        // delegation for a real user calendar.
      }),
    }
  )

  if (!res.ok) {
    throw new Error(`Calendar event creation failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

Deno.serve(async (req) => {
  try {
    const payload = (await req.json()) as WebhookPayload
    if (payload.table !== 'bookings' || payload.type !== 'INSERT') {
      return new Response('ignored', { status: 200 })
    }

    const booking = payload.record
    const accessToken = await getAccessToken()
    const event = await createCalendarEvent(booking, accessToken)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    await supabase
      .from('bookings')
      .update({ google_event_id: event.id })
      .eq('id', booking.id)

    return new Response(JSON.stringify({ ok: true, eventId: event.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
