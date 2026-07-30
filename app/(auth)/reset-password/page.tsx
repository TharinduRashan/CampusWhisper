'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    startTransition(async () => {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="animate-scale-in text-center space-y-6">
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-green-500/10 border border-green-500/20 shadow-lg">
          <CheckCircle2 className="size-9 text-green-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-ink mb-2">Password Updated!</h1>
          <p className="text-ink-muted text-sm">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
        </div>

        <Link href="/login" className="btn-primary btn-lg w-full inline-flex items-center justify-center">
          Proceed to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-ink mb-2">Set new password</h1>
        <p className="text-ink-muted text-sm leading-relaxed">
          Choose a new secure password for your CampusWhisper account.
        </p>
      </div>

      <div className="card p-8 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-sm font-medium text-ink-muted">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder="At least 6 characters"
                className={cn('input pl-10 pr-10', error && 'input-error')}
                autoComplete="new-password"
                autoFocus
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

          <div className="space-y-1.5">
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-ink-muted">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
              <input
                id="confirm-new-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
                placeholder="Re-enter new password"
                className={cn('input pl-10 pr-10', error && 'input-error')}
                autoComplete="new-password"
                disabled={isPending}
                minLength={6}
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
            disabled={isPending || !password || !confirmPassword}
            className="btn-primary btn-lg w-full mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating password…
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
