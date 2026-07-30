'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error)
  }, [error])

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-red-500/10 border border-red-500/20">
          <AlertOctagon className="size-9 text-red-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-ink mb-2">Something went wrong</h1>
          <p className="text-sm text-ink-subtle leading-relaxed">
            An unexpected error occurred while loading this page.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-ink-subtle/60 mt-2">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="btn-primary btn-md w-full sm:w-auto"
          >
            <RotateCcw className="size-4" />
            Try Again
          </button>
          <Link href="/" className="btn-secondary btn-md w-full sm:w-auto">
            <Home className="size-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
