'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, ArrowRight, Loader2, AlertCircle,
  CheckCircle2, ShieldCheck, EyeOff, GraduationCap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { COMMON_UNI_DOMAINS } from '@/lib/constants'

// University domain validation — client side check
function isUniversityEmail(email: string): boolean {
  const allowed = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? '').trim()
  if (!allowed) return true // dev mode — allow all

  const domains = allowed.split(',').map((d) => d.trim().toLowerCase())
  const lower = email.toLowerCase()
  return domains.some((d) => lower.endsWith(d))
}

// Password strength (optional — not required, magic link is primary)
const BENEFITS = [
  { icon: EyeOff, text: 'Completely anonymous — no usernames' },
  { icon: ShieldCheck, text: 'Only your university can verify you' },
  { icon: GraduationCap, text: 'Exclusively for university students' },
]

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [domainWarning, setDomainWarning] = useState(false)

  const supabase = createClient()

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setEmail(val)
    setError(null)

    // Live domain validation hint
    if (val.includes('@') && val.includes('.')) {
      const allowed = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? '').trim()
      if (allowed && !isUniversityEmail(val)) {
        setDomainWarning(true)
      } else {
        setDomainWarning(false)
      }
    } else {
      setDomainWarning(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      setError('Please enter your university email.')
      return
    }

    // Client-side domain check
    const allowed = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? '').trim()
    if (allowed && !isUniversityEmail(trimmedEmail)) {
      setError(
        `Only university emails are allowed. Accepted domains: ${
          allowed.split(',').join(', ')
        }`
      )
      return
    }

    startTransition(async () => {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true, // Signup — create account if it doesn't exist
          data: {
            // Pass initial metadata
            email_domain: trimmedEmail.split('@')[1],
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setSent(true)
    })
  }

  if (sent) {
    return <VerifyPromptCard email={email} />
  }

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">
          Join CampusWhisper
        </h1>
        <p className="text-ink-muted text-sm leading-relaxed">
          Discuss campus life anonymously — no name, no profile, just honest conversations.
        </p>
      </div>

      <div className="space-y-4">
        {/* Benefits */}
        <div className="card p-4 space-y-3">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="flex items-center justify-center size-8 rounded-xl bg-primary-600/10 shrink-0">
                <Icon className="size-4 text-primary-400" />
              </span>
              <span className="text-sm text-ink-muted">{text}</span>
            </div>
          ))}
        </div>

        {/* Signup form */}
        <div className="card p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-sm font-medium text-ink-muted">
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="yourname@university.edu"
                  className={cn(
                    'input pl-10',
                    (error || domainWarning) && 'input-error'
                  )}
                  autoComplete="email"
                  autoFocus
                  disabled={isPending}
                  required
                />
              </div>

              {/* Domain hint */}
              {domainWarning && !error && (
                <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3" />
                  This doesn&apos;t look like a university email
                </p>
              )}

              {/* Accepted domains hint */}
              {COMMON_UNI_DOMAINS.length > 0 && !domainWarning && !error && (
                <p className="text-xs text-ink-subtle mt-1">
                  Accepted: {COMMON_UNI_DOMAINS.slice(0, 4).join(', ')} and more
                </p>
              )}
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
              className="btn-primary btn-lg w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Anonymous Account
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="divider" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-card text-xs text-ink-subtle">
              Already have an account?
            </span>
          </div>

          <Link href="/login" className="btn-secondary btn-lg w-full">
            Sign in instead
          </Link>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-ink-subtle leading-relaxed">
          🔒 Your email is only used to verify you&apos;re a student.
          It&apos;s <strong className="text-ink-muted">never shown</strong> to anyone.
        </p>
      </div>
    </div>
  )
}

// ── Verify prompt after signup ─────────────────────────────────

function VerifyPromptCard({ email }: { email: string }) {
  return (
    <div className="animate-scale-in text-center space-y-6">
      {/* Icon */}
      <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-green-500/10 border border-green-500/20 shadow-lg">
        <CheckCircle2 className="size-9 text-green-400" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-ink mb-2">Verify your email</h1>
        <p className="text-ink-muted text-sm">
          We sent a verification link to:
        </p>
        <p className="font-semibold text-ink mt-1 text-sm bg-card border border-card-border rounded-xl px-4 py-2.5 inline-block">
          {email}
        </p>
      </div>

      <div className="card p-6 text-left space-y-4">
        <p className="text-sm font-semibold text-ink">What happens next?</p>
        {[
          { step: '1', text: 'Open your university inbox' },
          { step: '2', text: 'Click the verification link in the email' },
          { step: '3', text: 'You\'ll be signed in and ready to post anonymously!' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary-600/20 text-primary-400 text-xs font-bold shrink-0">
              {step}
            </span>
            <span className="text-sm text-ink-muted">{text}</span>
          </div>
        ))}
      </div>

      {/* Resend */}
      <p className="text-xs text-ink-subtle">
        Didn&apos;t receive it? Check your spam folder or{' '}
        <button
          onClick={() => window.location.reload()}
          className="text-primary-400 hover:text-primary-300 underline transition-colors"
        >
          try a different email
        </button>.
      </p>
    </div>
  )
}
