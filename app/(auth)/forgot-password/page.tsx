'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError('Please enter your university email.')
      return
    }

    startTransition(async () => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="animate-scale-in text-center space-y-6">
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary-600/15 border border-primary-600/20 shadow-glow">
          <CheckCircle2 className="size-9 text-primary-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-ink mb-2">Check your email</h1>
          <p className="text-ink-muted text-sm">
            We sent a password reset link to:
          </p>
          <p className="font-semibold text-ink mt-1 text-sm bg-card border border-card-border rounded-xl px-4 py-2.5 inline-block">
            {email}
          </p>
        </div>

        <p className="text-xs text-ink-subtle leading-relaxed max-w-sm mx-auto">
          Click the link inside the email to reset your password. If you don&apos;t see it, check your spam folder.
        </p>

        <Link href="/login" className="btn-secondary btn-lg w-full inline-flex items-center justify-center">
          Return to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors group"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to login
      </Link>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-ink mb-2">Reset password</h1>
        <p className="text-ink-muted text-sm leading-relaxed">
          Enter your university email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="card p-8 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="block text-sm font-medium text-ink-muted">
              University Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="yourname@university.edu"
                className={cn('input pl-10', error && 'input-error')}
                autoComplete="email"
                autoFocus
                disabled={isPending}
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="btn-primary btn-lg w-full mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending reset link…
              </>
            ) : (
              'Send Password Reset Link'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
