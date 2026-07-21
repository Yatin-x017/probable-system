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
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.smooth}
            className="lg:col-span-2"
          >
            <h1 className="text-display-md text-gray-900 mb-4">Contact</h1>
            <p className="text-gray-500 mb-8">{content.intro}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="p-2 rounded-lg bg-gray-50">
                  <Mail className="w-4 h-4" />
                </div>
                {content.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="p-2 rounded-lg bg-gray-50">
                  <MapPin className="w-4 h-4" />
                </div>
                {content.location}
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Prefer to schedule?
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Book a 30-minute call to discuss your project.
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-1 text-sm font-medium text-sky hover:underline"
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
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={springs.bouncy}
                className="bg-fresh-50 border border-fresh-200 rounded-xl p-8 text-center"
              >
                <CheckCircle className="w-12 h-12 text-fresh mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Message sent!
                </h2>
                <p className="text-gray-500 mb-6">
                  Thank you for reaching out. I'll get back to you as soon as possible.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="border-gray-200"
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
                className="space-y-5">
                {submitError && (
                  <div className="flex items-center gap-2 p-4 bg-coral-50 border border-coral-200 rounded-lg text-coral text-sm">
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
                    className={errors.message ? 'border-coral' : ''}
                  />
                  {errors.message && (
                    <p className="text-xs text-coral mt-1">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-900 hover:bg-gray-800"
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
