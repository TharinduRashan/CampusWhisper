import MainLayout from '@/components/layout/MainLayout'
import FloatingCreateButton from '@/components/layout/FloatingCreateButton'
import Toast from '@/components/ui/Toast'
import { getUserProfile } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, supabase] = await Promise.all([
    getUserProfile(),
    createClient(),
  ])

  // Fetch top categories for sidebar
  const { data: topCategories } = await (supabase
    .from('categories')
    .select('id, name, slug, color, post_count')
    .eq('is_active', true)
    .order('post_count', { ascending: false })
    .limit(11) as any)

  // Fetch unread notification count
  let unreadCount = 0
  if (profile) {
    const { count } = await (supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_read', false) as any)
    unreadCount = count ?? 0
  }

  return (
    <>
      <MainLayout
        profile={profile}
        topCategories={(topCategories as Pick<Category, 'id' | 'name' | 'slug' | 'color' | 'post_count'>[]) ?? []}
        unreadCount={unreadCount}
      >
        {children}
      </MainLayout>

      {/* Floating create button — mobile */}
      <FloatingCreateButton isAuthenticated={Boolean(profile)} />

      {/* Toast notifications */}
      <Toast />
    </>
  )
}
