import Link from 'next/link'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found | CampusWhisper',
}

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6 animate-fade-in">
        {/* Icon */}
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary-600/10 border border-primary-600/20 shadow-glow">
          <FileQuestion className="size-9 text-primary-400" />
        </div>

        {/* Text */}
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">404</h1>
          <h2 className="text-lg font-semibold text-ink-muted mb-2">Page Not Found</h2>
          <p className="text-sm text-ink-subtle leading-relaxed">
            The whisper you are looking for may have been deleted, moved, or never existed in the first place.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="btn-primary btn-md w-full sm:w-auto">
            <Home className="size-4" />
            Back to Home
          </Link>
          <Link href="/categories" className="btn-secondary btn-md w-full sm:w-auto">
            Browse Categories
          </Link>
        </div>
      </div>
    </div>
  )
}
