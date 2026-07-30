'use client'

import { Suspense, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(
    errorParam === 'suspended'
      ? 'Your account has been suspended. Contact us if you believe this is a mistake.'
      : null
  )

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) {
      setError('Please enter your university email.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    startTransition(async () => {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (authError) {
        if (
          authError.message.toLowerCase().includes('invalid login credentials') ||
          authError.message.toLowerCase().includes('invalid credentials')
        ) {
          setError('Invalid email or password. Please check your credentials.')
        } else if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Please verify your email address first using the link sent to your inbox.')
        } else {
          setError(authError.message)
        }
        return
      }

      // Store remember me preference in localStorage
      try {
        localStorage.setItem('remember_me', rememberMe ? 'true' : 'false')
      } catch { /* ignore */ }

      router.push(next)
      router.refresh()
    })
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Heading */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-400 text-xs font-semibold mb-3">
          <Sparkles className="size-3" />
          University Students Only
        </div>
        <h1 className="text-3xl font-bold text-ink mb-2">Welcome back</h1>
        <p className="text-ink-muted text-sm leading-relaxed">
          Sign in with your email and password to access CampusWhisper.
        </p>
      </div>

      {/* Login Card */}
      <div className="card p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
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

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-ink-muted">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary-400 hover:text-primary-300 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder="••••••••"
                className={cn('input pl-10 pr-10', error && 'input-error')}
                autoComplete="current-password"
                disabled={isPending}
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

          {/* Stay logged in checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-ink-muted hover:text-ink transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-card-border bg-card text-primary-600 focus:ring-primary-500 focus:ring-offset-surface cursor-pointer"
              />
              Stay logged in
            </label>
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
            disabled={isPending || !email.trim() || !password}
            className="btn-primary btn-lg w-full mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="divider" />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-card text-xs text-ink-subtle">
            New to CampusWhisper?
          </span>
        </div>

        {/* Sign up link */}
        <Link href="/signup" className="btn-secondary btn-lg w-full">
          Create an account
        </Link>
      </div>

      {/* Anonymous note */}
      <p className="text-center text-xs text-ink-subtle leading-relaxed">
        🔒 Your email is used only for verification and is{' '}
        <strong className="text-ink-muted font-medium">never displayed publicly</strong>.
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
