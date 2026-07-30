import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Auth Error' }

interface Props {
  searchParams: Promise<{ error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_code:
    'The verification link is missing or invalid. Please try signing in again.',
  auth_failed:
    'We couldn\'t verify your identity. The link may have expired (links expire after 1 hour).',
  suspended:
    'Your account has been suspended. Contact us if you believe this is a mistake.',
  forbidden:
    'You don\'t have permission to access that page.',
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const params = await searchParams
  const errorCode = params.error ?? 'auth_failed'
  const message = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.auth_failed

  return (
    <div className="animate-fade-in text-center space-y-6">
      <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="size-9 text-red-400" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-ink mb-2">Something went wrong</h1>
        <p className="text-ink-muted text-sm leading-relaxed max-w-sm mx-auto">
          {message}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/login" className="btn-primary btn-lg">
          Try signing in again
        </Link>
        <Link href="/" className="btn-ghost btn-sm">
          Go to home
        </Link>
      </div>
    </div>
  )
}
