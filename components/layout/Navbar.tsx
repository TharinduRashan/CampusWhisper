'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, LogOut, MessageCircle, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ui/ThemeToggle'
import SearchBar from '@/components/ui/SearchBar'
import { signOut } from '@/app/(auth)/actions'

interface NavbarProps {
  isAuthenticated: boolean
  isAdmin?: boolean
  unreadCount?: number
}

export default function Navbar({ isAuthenticated, isAdmin = false, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname()
  const isSearchPage = pathname === '/search'

  return (
    <header className="sticky top-0 z-50 glass border-b border-card-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo — hidden on md+ since sidebar has it */}
        <Link href="/" className="flex items-center gap-2 md:hidden shrink-0">
          <span className="flex items-center justify-center size-7 rounded-lg bg-primary-600">
            <MessageCircle className="size-3.5 text-white" />
          </span>
          <span className="font-bold text-sm gradient-text">CampusWhisper</span>
        </Link>

        {/* Search bar (hidden on search page itself, hidden on mobile) */}
        {!isSearchPage && (
          <div className="hidden sm:block flex-1 max-w-sm mx-auto">
            <SearchBar />
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {/* Mobile search link */}
          {!isSearchPage && (
            <Link
              href="/search"
              className="sm:hidden btn-ghost p-2.5 rounded-xl"
              aria-label="Search"
            >
              <Search className="size-4" />
            </Link>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className={cn('btn-ghost p-2.5 rounded-xl relative', pathname === '/notifications' && 'bg-card')}
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary-500 ring-2 ring-surface" />
                )}
              </Link>

              {/* Admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn('btn-ghost p-2.5 rounded-xl hidden sm:flex', pathname.startsWith('/admin') && 'bg-card text-primary-400')}
                  aria-label="Admin dashboard"
                >
                  <Shield className="size-4" />
                </Link>
              )}

              {/* Sign out */}
              <form action={signOut}>
                <button
                  type="submit"
                  className="btn-ghost p-2.5 rounded-xl text-ink-subtle hover:text-red-400"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm text-sm">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary btn-sm text-sm">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
