import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/server'
import NotificationItem from '@/components/ui/NotificationItem'
import EmptyState from '@/components/ui/EmptyState'
import type { NotificationWithContext } from '@/types'
import NotificationsHeader from './NotificationsHeader'

export const metadata: Metadata = {
  title: 'Notifications — CampusWhisper',
  description: 'Your activity updates and replies.',
}

export default async function NotificationsPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login?next=/notifications')
  }

  const supabase = await createClient()

  // Fetch notifications
  const { data: notificationsRaw } = await (supabase
    .from('notifications')
    .select(`
      *,
      posts (title)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50) as any)

  const notifications: NotificationWithContext[] = (notificationsRaw ?? []).map((n: any) => ({
    ...n,
    post_title: n.posts?.title,
  }))

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <NotificationsHeader unreadCount={unreadCount} />

      {/* List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When someone replies to your post or comment, you'll see it here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  )
}
