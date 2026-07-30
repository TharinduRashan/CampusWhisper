'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, TrendingUp, Grid3X3, Search, Bookmark, Bell,
  Settings, Shield, MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import type { Category } from '@/types'

const NAV_ITEMS = [
  { href: '/',              icon: Home,       label: 'Home'          },
  { href: '/trending',      icon: TrendingUp, label: 'Trending'      },
  { href: '/categories',    icon: Grid3X3,    label: 'Categories'    },
  { href: '/search',        icon: Search,     label: 'Search'        },
  { href: '/bookmarks',     icon: Bookmark,   label: 'Bookmarks'     },
  { href: '/notifications', icon: Bell,       label: 'Notifications' },
]

interface SidebarProps {
  isAdmin?: boolean
  unreadCount?: number
  topCategories?: Pick<Category, 'id' | 'name' | 'slug' | 'color' | 'post_count'>[]
}

export default function Sidebar({
  isAdmin = false,
  unreadCount = 0,
  topCategories = [],
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col gap-1 w-60 shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-3 py-2 mb-2 group">
        <span className="flex items-center justify-center size-8 rounded-xl bg-primary-600 shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
          <MessageCircle className="size-4 text-white" />
        </span>
        <span className="text-lg font-bold gradient-text">CampusWhisper</span>
      </Link>

      {/* Main nav */}
      <nav className="space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const isNotifications = href === '/notifications'
          return (
            <Link
              key={href}
              href={href}
              className={cn('nav-item', isActive && 'nav-item-active')}
            >
              <span className="relative">
                <Icon className="size-4.5" />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center size-3.5 rounded-full bg-primary-600 text-[8px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          )
        })}

        <Link href="/settings" className={cn('nav-item', pathname.startsWith('/settings') && 'nav-item-active')}>
          <Settings className="size-4.5" />
          <span>Settings</span>
        </Link>

        {isAdmin && (
          <Link href="/admin" className={cn('nav-item', pathname.startsWith('/admin') && 'nav-item-active')}>
            <Shield className="size-4.5" />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* Top categories */}
      {topCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-card-border">
          <p className="px-3 text-[11px] font-semibold text-ink-subtle uppercase tracking-wider mb-2">
            Categories
          </p>
          <div className="space-y-0.5">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={cn(
                  'nav-item text-xs',
                  pathname === `/categories/${cat.slug}` && 'nav-item-active'
                )}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 truncate">{cat.name}</span>
                <span className="text-[10px] text-ink-subtle">{cat.post_count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Community links */}
      <div className="mt-auto pt-4 border-t border-card-border space-y-0.5">
        <Link href="/guidelines" className="nav-item text-xs">
          <span className="text-xs">📋</span> Guidelines
        </Link>
        <Link href="/privacy" className="nav-item text-xs">
          <span className="text-xs">🔒</span> Privacy
        </Link>
      </div>
    </aside>
  )
}
