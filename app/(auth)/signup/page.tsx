'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle,
  CheckCircle2, ShieldCheck, GraduationCap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { COMMON_UNI_DOMAINS } from '@/lib/constants'

function isUniversityEmail(email: string): boolean {
  const allowed = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? '').trim()
  if (!allowed) return true // dev mode — allow all

  const domains = allowed.split(',').map((d) => d.trim().toLowerCase())
  const lower = email.toLowerCase()
  return domains.some((d) => lower.endsWith(d))
}

const BENEFITS = [
  { icon: EyeOff, text: 'Completely anonymous — no public usernames' },
  { icon: ShieldCheck, text: 'Only verified student email accounts' },
  { icon: GraduationCap, text: 'Exclusive to university students' },
]

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [domainWarning, setDomainWarning] = useState(false)

  const supabase = createClient()

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setEmail(val)
    setError(null)

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

    const allowed = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? '').trim()
    if (allowed && !isUniversityEmail(trimmedEmail)) {
      setError(
        `Only university emails are allowed. Accepted domains: ${allowed.split(',').join(', ')}`
      )
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password,
          }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error?.message ?? 'Failed to create account')
        }

        // Account created & verified — automatically log in with password
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })

        if (loginError) {
          throw new Error(loginError.message)
        }

        router.push('/')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Signup failed')
      }
    })
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-ink mb-2">
          Join CampusWhisper
        </h1>
        <p className="text-ink-muted text-sm leading-relaxed">
          Create an account with your university email to discuss campus life anonymously.
        </p>
      </div>

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

      {/* Signup Form */}
      <div className="card p-8 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="block text-sm font-medium text-ink-muted">
              University Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="yourname@university.edu"
                className={cn('input pl-10', (error || domainWarning) && 'input-error')}
                autoComplete="email"
                autoFocus
                disabled={isPending}
                required
              />
            </div>
            {domainWarning && !error && (
              <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                <AlertCircle className="size-3" />
                Must be a valid university email address
              </p>
            )}
            {COMMON_UNI_DOMAINS.length > 0 && !domainWarning && !error && (
              <p className="text-xs text-ink-subtle mt-1">
                Accepted: {COMMON_UNI_DOMAINS.slice(0, 4).join(', ')} and more
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="block text-sm font-medium text-ink-muted">
              Create Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder="At least 6 characters"
                className={cn('input pl-10 pr-10', error && 'input-error')}
                autoComplete="new-password"
                disabled={isPending}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-ink-muted">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
                placeholder="Re-enter password"
                className={cn('input pl-10 pr-10', error && 'input-error')}
                autoComplete="new-password"
                disabled={isPending}
                minLength={6}
                required
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !email.trim() || !password}
            className="btn-primary btn-lg w-full mt-2"
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
          Sign in with Password
        </Link>
      </div>

      <p className="text-center text-xs text-ink-subtle leading-relaxed">
        🔒 Your email is used only for verification and is <strong className="text-ink-muted">never displayed publicly</strong>.
      </p>
    </div>
  )
}
