import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import type { Category, Profile } from '@/types'

interface MainLayoutProps {
  children: React.ReactNode
  profile: Profile | null
  topCategories?: Pick<Category, 'id' | 'name' | 'slug' | 'color' | 'post_count'>[]
  unreadCount?: number
}

export default function MainLayout({
  children,
  profile,
  topCategories = [],
  unreadCount = 0,
}: MainLayoutProps) {
  const isAuthenticated = Boolean(profile)

  return (
    <div className="min-h-dvh bg-surface">
      {/* Top navbar */}
      <Navbar
        isAuthenticated={isAuthenticated}
        isAdmin={profile?.is_admin}
        unreadCount={unreadCount}
      />

      {/* Main content area */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-24 md:pb-8 flex gap-6">
        {/* Desktop sidebar */}
        <Sidebar
          isAdmin={profile?.is_admin}
          unreadCount={unreadCount}
          topCategories={topCategories}
        />

        {/* Page content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav unreadCount={unreadCount} />
    </div>
  )
}
