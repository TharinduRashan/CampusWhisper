import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to CampusWhisper with your university email.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-primary-800/8 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-primary-700/6 blur-[80px]" />
      </div>

      {/* Logo top-left */}
      <header className="relative z-10 p-6">
        <a href="/" className="inline-flex items-center gap-2.5 group">
          <span className="flex items-center justify-center size-8 rounded-xl bg-primary-600 shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 text-white"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="text-lg font-bold gradient-text">CampusWhisper</span>
        </a>
      </header>

      {/* Centered content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-8 text-center">
        <p className="text-xs text-ink-subtle">
          By continuing, you agree to our{' '}
          <a href="/guidelines" className="text-ink-muted hover:text-primary-400 transition-colors">
            Community Guidelines
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-ink-muted hover:text-primary-400 transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
