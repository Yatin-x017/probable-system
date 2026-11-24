import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, CheckCircle, AlertCircle, ArrowRight, Mail, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { submitContactMessage, friendlySubmissionError } from '@/lib/supabase/api'
import { getSiteContent } from '@/lib/supabase/content'
import { DEFAULT_CONTACT_PAGE } from '@/lib/content/defaults'
import { springs } from '@/lib/motion'
import type { ContactPageContent } from '@/lib/content/defaults'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [content, setContent] = useState<ContactPageContent>(DEFAULT_CONTACT_PAGE)

  useEffect(() => {
    getSiteContent('contact_page').then(setContent).catch(console.error)
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email address'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    else if (formData.message.trim().length < 10)
      newErrors.message = 'Message must be at least 10 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await submitContactMessage(formData.name, formData.email, formData.message)
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      setSubmitError(friendlySubmissionError(err))
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[75svh] bg-[#f6f1e8] pb-20 pt-[120px] text-[#182338] sm:pb-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.smooth}
            className="lg:col-span-1"
          >
            <h1 className="font-display text-[clamp(3.6rem,8vw,7rem)] font-extrabold leading-[0.86] tracking-[-0.075em] text-[#182338]">Let’s talk<span className="text-[#f05b43]">.</span></h1>
            <p className="mb-8 mt-6 max-w-lg text-base leading-7 text-[#515d70]">{content.intro}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 border-t border-[#182338]/20 py-3 text-sm text-[#182338]">
                <div className="text-[#f05b43]">
                  <Mail className="h-4 w-4" />
                </div>
                {content.email}
              </div>
              <div className="flex items-center gap-3 border-t border-[#182338]/20 py-3 text-sm text-[#182338]">
                <div className="text-[#f05b43]">
                  <MapPin className="h-4 w-4" />
                </div>
                {content.location}
              </div>
            </div>

            <div className="bg-[#efc65f] p-5">
              <h3 className="mb-2 font-display text-lg font-bold tracking-[-0.04em] text-[#182338]">
                Prefer to schedule?
              </h3>
              <p className="mb-3 text-sm text-[#182338]/75">
                Book a 30-minute call to discuss your project.
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#182338] underline decoration-[#f05b43] decoration-2 underline-offset-4"
              >
                Book a time
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.08 }}
            className="lg:col-span-1"
          >
            <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={springs.bouncy}
                className="border border-[#4f8a67]/30 bg-[#e3ecde] p-8 text-center"
              >
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#4f8a67]" />
                <h2 className="mb-2 font-display text-xl font-bold text-[#182338]">
                  Message sent!
                </h2>
                <p className="mb-6 text-[#515d70]">
                  Thank you for reaching out. I'll get back to you as soon as possible.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="rounded-none border-[#182338]/25 text-[#182338]"
                >
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6">
                {submitError && (
                  <div className="flex items-center gap-2 border border-[#f05b43]/30 bg-[#f8dfd6] p-4 text-sm text-[#9c2e20]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {submitError}
                  </div>
                )}

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your name"
                    className={`mt-1 min-h-12 rounded-none border-[#182338]/25 bg-white/55 placeholder:text-[#737988] focus-visible:ring-[#f05b43] ${errors.name ? 'border-[#f05b43]' : ''}`}
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
                    className={`mt-1 min-h-12 rounded-none border-[#182338]/25 bg-white/55 placeholder:text-[#737988] focus-visible:ring-[#f05b43] ${errors.email ? 'border-[#f05b43]' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-coral mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Tell me about your project..."
                    rows={6}
                    className={`mt-1 rounded-none border-[#182338]/25 bg-white/55 placeholder:text-[#737988] focus-visible:ring-[#f05b43] ${errors.message ? 'border-[#f05b43]' : ''}`}
                  />
                  {errors.message && (
                    <p className="text-xs text-coral mt-1">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full rounded-none bg-[#182338] text-[#f6f1e8] hover:bg-[#f05b43] hover:text-[#182338]"
                >
                  {submitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.form>
            )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
