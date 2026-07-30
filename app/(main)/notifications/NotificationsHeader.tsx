'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface NotificationsHeaderProps {
  unreadCount: number
}

export default function NotificationsHeader({ unreadCount: initialUnread }: NotificationsHeaderProps) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(initialUnread)
  const [isPending, startTransition] = useTransition()

  async function handleMarkAllRead() {
    if (unreadCount === 0 || isPending) return

    startTransition(async () => {
      try {
        const res = await fetch('/api/notifications', { method: 'PATCH' })
        if (!res.ok) throw new Error('Failed to mark notifications as read')
        setUnreadCount(0)
        toast.success('All notifications marked as read')
        router.refresh()
      } catch {
        toast.error('Failed to mark notifications as read')
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-2xl bg-primary-600/10">
          <Bell className="size-5 text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary-600 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-ink-subtle">Activity updates on your posts & comments</p>
        </div>
      </div>

      {unreadCount > 0 && (
        <button
          onClick={handleMarkAllRead}
          disabled={isPending}
          className="btn-ghost btn-sm text-xs text-primary-400 hover:text-primary-300"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <>
              <CheckCheck className="size-3.5" />
              Mark all read
            </>
          )}
        </button>
      )}
    </div>
  )
}
