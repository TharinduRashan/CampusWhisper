import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0f0f14' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'CampusWhisper — Anonymous Campus Discussions',
    template: '%s | CampusWhisper',
  },
  description:
    'A safe, anonymous space for university students to discuss campus life, share confessions, ask questions, and connect — without revealing your identity.',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  keywords: [
    'campus',
    'anonymous',
    'university',
    'students',
    'discussion',
    'confessions',
    'gossip',
    'campus news',
  ],
  authors: [{ name: 'CampusWhisper' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    siteName: 'CampusWhisper',
    title: 'CampusWhisper — Anonymous Campus Discussions',
    description:
      'A safe, anonymous space for university students to discuss campus life.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampusWhisper — Anonymous Campus Discussions',
    description:
      'A safe, anonymous space for university students to discuss campus life.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else if (saved === 'dark') {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-surface text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
