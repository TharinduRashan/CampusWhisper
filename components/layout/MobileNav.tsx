'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Grid3X3, Search, Bookmark, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',              icon: Home,        label: 'Home'          },
  { href: '/trending',      icon: TrendingUp,  label: 'Trending'      },
  { href: '/categories',    icon: Grid3X3,     label: 'Categories'    },
  { href: '/search',        icon: Search,      label: 'Search'        },
  { href: '/notifications', icon: Bell,        label: 'Alerts'        },
]

interface MobileNavProps {
  unreadCount?: number
}

export default function MobileNav({ unreadCount = 0 }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      {/* Frosted glass bar */}
      <div className="glass border-t border-card-border px-2 pb-safe">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            const isNotifications = href === '/notifications'

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'mobile-nav-item',
                  isActive && 'mobile-nav-item-active'
                )}
                aria-label={label}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {/* Unread badge on notifications */}
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center size-4 rounded-full bg-primary-600 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
