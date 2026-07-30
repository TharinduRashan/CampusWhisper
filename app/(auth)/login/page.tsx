'use client'

import { Suspense, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'suspended'
      ? 'Your account has been suspended. Contact us if you believe this is a mistake.'
      : null
  )

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your university email.')
      return
    }

    startTransition(async () => {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          shouldCreateUser: false, // Login only — signup is separate
        },
      })

      if (authError) {
        if (
          authError.message.toLowerCase().includes('not found') ||
          authError.message.toLowerCase().includes('invalid')
        ) {
          setError("No account found with that email. Please sign up first.")
        } else {
          setError(authError.message)
        }
        return
      }

      setSent(true)
    })
  }

  if (sent) {
    return <CheckEmailCard email={email} />
  }

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-400 text-xs font-semibold mb-4">
          <Sparkles className="size-3" />
          University Students Only
        </div>
        <h1 className="text-3xl font-bold text-ink mb-2">Welcome back</h1>
        <p className="text-ink-muted text-sm leading-relaxed">
          Sign in with your university email to access anonymous campus discussions.
        </p>
      </div>

      {/* Card */}
      <div className="card p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-ink-muted">
              University Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@university.edu"
                className={cn(
                  'input pl-10',
                  error && 'input-error'
                )}
                autoComplete="email"
                autoFocus
                disabled={isPending}
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="btn-primary btn-lg w-full mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending magic link…
              </>
            ) : (
              <>
                Continue with Email
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="divider" />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-card text-xs text-ink-subtle">
            New here?
          </span>
        </div>

        {/* Sign up link */}
        <Link
          href="/signup"
          className="btn-secondary btn-lg w-full"
        >
          Create an account
        </Link>
      </div>

      {/* Anonymous note */}
      <p className="text-center text-xs text-ink-subtle mt-6 leading-relaxed">
        🔒 Your email is used only for verification and is{' '}
        <strong className="text-ink-muted font-medium">never displayed publicly</strong>.
        You remain completely anonymous.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-subtle">Loading sign in…</div>}>
      <LoginForm />
    </Suspense>
  )
}

function CheckEmailCard({ email }: { email: string }) {
  return (
    <div className="animate-scale-in text-center">
      <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary-600/15 border border-primary-600/20 mb-6 shadow-glow">
        <Mail className="size-9 text-primary-400" />
      </div>

      <h1 className="text-2xl font-bold text-ink mb-2">Check your inbox</h1>
      <p className="text-ink-muted text-sm mb-1">
        We sent a magic link to:
      </p>
      <p className="font-semibold text-ink mb-6 text-sm bg-card border border-card-border rounded-xl px-4 py-2.5 inline-block">
        {email}
      </p>

      <div className="card p-6 text-left space-y-3 mb-6">
        {[
          { step: '1', text: 'Open your university email' },
          { step: '2', text: 'Click the "Sign in to CampusWhisper" link' },
          { step: '3', text: 'You\'ll be signed in automatically' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary-600/20 text-primary-400 text-xs font-bold shrink-0">
              {step}
            </span>
            <span className="text-sm text-ink-muted">{text}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-subtle">
        Didn&apos;t receive it? Check your spam folder or{' '}
        <button
          onClick={() => window.location.reload()}
          className="text-primary-400 hover:text-primary-300 underline transition-colors"
        >
          try again
        </button>
        .
      </p>
    </div>
  )
}
