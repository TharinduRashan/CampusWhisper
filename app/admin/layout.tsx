import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserProfile } from '@/lib/supabase/server'
import { LayoutDashboard, Flag, FileText, Users, ArrowLeft, Shield } from 'lucide-react'
import Toast from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Admin Dashboard — CampusWhisper',
}

const ADMIN_NAV = [
  { href: '/admin',          icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/reports',  icon: Flag,            label: 'Reports'  },
  { href: '/admin/posts',    icon: FileText,        label: 'Posts'    },
  { href: '/admin/users',    icon: Users,           label: 'Users'    },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile || !profile.is_admin) {
    redirect('/login?error=forbidden')
  }

  return (
    <div className="min-h-dvh bg-surface text-ink flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 glass border-b border-card-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-ghost btn-xs text-ink-muted hover:text-ink">
              <ArrowLeft className="size-3.5" /> Back to App
            </Link>
            <span className="h-4 w-px bg-card-border" />
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-violet-400" />
              <span className="font-bold text-sm gradient-text">CampusWhisper Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex-1 flex flex-col md:flex-row gap-6 w-full">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-52 shrink-0 space-y-1">
          {ADMIN_NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-ink-muted hover:text-ink hover:bg-card transition-colors"
            >
              <Icon className="size-4 text-primary-400" />
              <span>{label}</span>
            </Link>
          ))}
        </aside>

        {/* Content area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      <Toast />
    </div>
  )
}
