import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { TimePicker } from '@/components/TimePicker'
import { createBooking, friendlySubmissionError } from '@/lib/supabase/api'
import { sendBookingConfirmationEmail } from '@/lib/emailjs'
import { buildGoogleCalendarUrl } from '@/lib/googleCalendarLink'
import { useRevealUp } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Working-hours hint shown next to the picker. It's guidance, not a hard
// clamp — the picker's +/- adjuster already clamps to 00:00–23:59.
const WORKING_HOURS_HINT = '9:00 AM – 4:30 PM, IST'

// Booking availability window: tomorrow through 7 days out.
function getBookableRange() {
  const today = new Date()
  const min = new Date(today)
  min.setDate(today.getDate() + 1)
  min.setHours(0, 0, 0, 0)
  const max = new Date(today)
  max.setDate(today.getDate() + 7)
  max.setHours(23, 59, 59, 999)
  return { min, max }
}

export default function Book() {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  const [timeTouched, setTimeTouched] = useState(false)
  const [timePickerOpen, setTimePickerOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', purpose: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmedRange, setConfirmedRange] = useState<{ start: Date; end: Date } | null>(null)
  const revealUp = useRevealUp()

  const { min: minBookableDate, max: maxBookableDate } = getBookableRange()

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!selectedDate) newErrors.date = 'Please select a date'
    if (!timeTouched) newErrors.time = 'Please confirm a time'
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email address'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const startDate = new Date(`${selectedDate}T${selectedTime}`)
      const endDate = new Date(startDate.getTime() + 30 * 60000)

      await createBooking(
        formData.name,
        formData.email,
        startDate.toISOString(),
        endDate.toISOString(),
        formData.purpose
      )
      setConfirmedRange({ start: startDate, end: endDate })
      setSubmitted(true)

      // Fire-and-forget: the booking is already saved, so a failed email
      // shouldn't block the confirmation screen from showing.
      sendBookingConfirmationEmail({
        name: formData.name,
        email: formData.email,
        purpose: formData.purpose,
        date: formatDate(startDate),
        time: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }).catch((err) => console.error('Failed to send confirmation email:', err))
    } catch (err) {
      setSubmitError(friendlySubmissionError(err))
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const dateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <motion.div {...revealUp} className="mb-12">
          <h1 className="text-display-md text-gray-900">Book a Call</h1>
          <p className="mt-2 text-gray-500">
            Schedule a 30-minute consultation to discuss your project.
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={revealUp.initial}
            animate={revealUp.whileInView}
            transition={revealUp.transition}
            className="bg-fresh-50 border border-fresh-200 rounded-xl p-8 text-center"
          >
            <CheckCircle className="w-12 h-12 text-fresh mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Booking confirmed!
            </h2>
            <p className="text-gray-500">
              I look forward to speaking with you. You'll receive a confirmation
              email shortly.
            </p>
            {confirmedRange && (
              <a
                href={buildGoogleCalendarUrl({
                  title: `Call with ${formData.name || 'you'}`,
                  description: formData.purpose,
                  startsAt: confirmedRange.start,
                  endsAt: confirmedRange.end,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}
              >
                <CalendarIcon className="w-4 h-4" />
                Add to Google Calendar
              </a>
            )}
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            {submitError && (
              <div className="flex items-center gap-2 p-4 bg-coral-50 border border-coral-200 rounded-lg text-coral text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            {/* Date Selection */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <CalendarIcon className="w-4 h-4" />
                Select a date
              </Label>
              <Popover>
                <PopoverTrigger
                  type="button"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'w-full sm:w-64 justify-start text-left font-normal',
                    errors.date && 'border-coral'
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {selectedDate ? formatDate(new Date(selectedDate)) : 'Pick a date'}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? new Date(selectedDate) : undefined}
                    onSelect={(date) => date && setSelectedDate(dateKey(date))}
                    disabled={(date) => date < minBookableDate || date > maxBookableDate}
                    defaultMonth={minBookableDate}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-xs text-coral mt-1">{errors.date}</p>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="animate-fade-in">
                <Label className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" />
                  Select a time ({formatDate(new Date(selectedDate))})
                </Label>
                {/* The clock-face popover portals itself above page content and
                    positions itself relative to the trigger button, so this
                    wrapper no longer needs to reserve extra space for it. */}
                <div className="flex flex-col items-start gap-2 mt-3">
                  <TimePicker
                    value={selectedTime}
                    onChange={(t) => {
                      setSelectedTime(t)
                      setTimeTouched(true)
                    }}
                    error={!!errors.time}
                    onOpenChange={setTimePickerOpen}
                  />
                  <p
                    className={`text-xs text-gray-400 transition-opacity duration-200 ${
                      timePickerOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    Tap the time to open adjusters. Working hours: {WORKING_HOURS_HINT}
                  </p>
                </div>
                {errors.time && (
                  <p className="text-xs text-coral mt-1">{errors.time}</p>
                )}
              </div>
            )}

            {/* Contact Details */}
            {timeTouched && (
              <div className="animate-fade-in space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Your name"
                      className={errors.name ? 'border-coral' : ''}
                    />
                    {errors.name && (
                      <p className="text-xs text-coral mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                      className={errors.email ? 'border-coral' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-coral mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose (optional)</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, purpose: e.target.value }))
                    }
                    placeholder="Briefly describe what you'd like to discuss"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-900 hover:bg-gray-800"
                >
                  {submitting ? 'Confirming...' : 'Confirm Booking'}
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
