import { Suspense } from 'react'
import { Mail, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Your Email',
}

export default function VerifyPage() {
  return (
    <div className="animate-fade-in text-center space-y-8">
      {/* Icon */}
      <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary-600/10 border border-primary-600/20 shadow-glow">
        <Mail className="size-9 text-primary-400" />
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-ink mb-2">Check your email</h1>
        <p className="text-ink-muted text-sm leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent you a magic link. Click it to verify your university
          email and gain access to CampusWhisper.
        </p>
      </div>

      {/* Steps */}
      <div className="card p-6 text-left space-y-4">
        {[
          {
            icon: Mail,
            title: 'Open your university inbox',
            desc: 'Look for an email from CampusWhisper',
          },
          {
            icon: Clock,
            title: 'The link expires in 1 hour',
            desc: 'Request a new one from the login page if it expires',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex items-center justify-center size-8 rounded-xl bg-card-hover shrink-0 mt-0.5">
              <Icon className="size-4 text-ink-muted" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{title}</p>
              <p className="text-xs text-ink-subtle mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Back to login */}
      <a
        href="/login"
        className="btn-ghost btn-sm inline-flex"
      >
        ← Back to sign in
      </a>
    </div>
  )
}
