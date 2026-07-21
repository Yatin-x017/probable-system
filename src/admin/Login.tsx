import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { Loader2, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useLoginAttemptLimiter } from './useLoginAttemptLimiter'

type LocationState = { from?: Location } | null

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { isLocked, remainingSeconds, recordFailure, reset } = useLoginAttemptLimiter()

  const from = (location.state as LocationState)?.from
  const redirectTo = from ? `${from.pathname}${from.search}` : '/admin'

  // Already signed in and landed on /admin/login anyway (bookmark, back
  // button, typed URL) — send them straight through instead of showing a
  // login form they don't need.
  if (!authLoading && user) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (isLocked) return

    setSubmitting(true)
    const { error: signInError } = await signInWithEmail(email, password)

    if (signInError) {
      recordFailure()
      setError(signInError.message)
      setSubmitting(false)
      return
    }

    reset()
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to manage your portfolio
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          {error && !isLocked && (
            <div className="flex items-center gap-2 p-3 bg-coral-50 border border-coral-200 rounded-lg text-coral text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-2 p-3 bg-sunny-50 border border-sunny-200 rounded-lg text-sunny-800 text-sm">
              <Clock className="w-4 h-4 shrink-0" />
              Too many failed attempts. Try again in {remainingSeconds}s.
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={isLocked}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLocked}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || isLocked}
            className="w-full bg-gray-900 hover:bg-gray-800"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLocked ? (
              `Try again in ${remainingSeconds}s`
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          <a href="/" className="hover:text-gray-600 transition-colors">
            Back to site
          </a>
        </p>
      </div>
    </div>
  )
}
