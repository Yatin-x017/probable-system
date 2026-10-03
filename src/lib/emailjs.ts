import emailjs from '@emailjs/browser'

// EmailJS free tier = 200 emails/month, sent directly from the browser
// (no backend needed). Create a service + template at
// https://dashboard.emailjs.com and drop the three IDs into your .env file
// — see .env.example for the variable names.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined

export interface BookingEmailParams {
  name: string
  email: string
  purpose?: string
  /** Human-readable date, e.g. "Tue, Jul 21" */
  date: string
  /** Human-readable time, e.g. "9:00 AM IST" */
  time: string
}

// Sends the confirmation email. Template on the EmailJS side should expect
// these variable names: {{to_name}}, {{to_email}}, {{date}}, {{time}}, {{purpose}}.
// Failing to send never blocks the booking itself — we've already saved the
// row in Supabase by the time this runs, so we just log and move on.
export async function sendBookingConfirmationEmail(params: BookingEmailParams): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn(
      'EmailJS is not configured — skipping confirmation email. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY in your .env file.'
    )
    return
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_name: params.name,
      to_email: params.email,
      date: params.date,
      time: params.time,
      purpose: params.purpose || '—',
    },
    { publicKey: PUBLIC_KEY }
  )
}
