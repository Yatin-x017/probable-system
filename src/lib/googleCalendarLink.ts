// Builds a Google Calendar "quick add" link. No API key, no auth, no backend —
// clicking it just opens Google Calendar with the event pre-filled so the
// visitor can add it to their own calendar. Completely free.
// Docs: https://support.google.com/calendar/thread (template URL is unofficial
// but stable and widely used).
export function buildGoogleCalendarUrl(params: {
  title: string
  description?: string
  startsAt: Date
  endsAt: Date
}): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')

  const search = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${fmt(params.startsAt)}/${fmt(params.endsAt)}`,
    details: params.description || '',
  })

  return `https://calendar.google.com/calendar/render?${search.toString()}`
}
