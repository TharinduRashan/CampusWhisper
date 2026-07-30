import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import type { NotificationWithContext } from '@/types'
import { NOTIFICATION_LABELS } from '@/lib/constants'
import { Bell, MessageCircle, ArrowUpCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ElementType> = {
  post_reply:    MessageCircle,
  comment_reply: MessageCircle,
  post_vote:     ArrowUpCircle,
  system:        Info,
}

interface NotificationItemProps {
  notification: NotificationWithContext
  onRead?: (id: string) => void
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const Icon = ICONS[notification.type] ?? Bell
  const label = NOTIFICATION_LABELS[notification.type] ?? 'Notification'
  const href = notification.related_post_id
    ? `/post/${notification.related_post_id}${
        notification.related_comment_id
          ? `#comment-${notification.related_comment_id}`
          : ''
      }`
    : '#'

  return (
    <Link
      href={href}
      onClick={() => !notification.is_read && onRead?.(notification.id)}
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-xl',
        'transition-all duration-150 group',
        notification.is_read
          ? 'hover:bg-card-hover'
          : 'bg-primary-600/5 border border-primary-600/10 hover:bg-primary-600/10'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex items-center justify-center size-9 rounded-xl shrink-0 mt-0.5',
        notification.is_read ? 'bg-card' : 'bg-primary-600/15'
      )}>
        <Icon className={cn(
          'size-4',
          notification.is_read ? 'text-ink-muted' : 'text-primary-400'
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm leading-snug',
          notification.is_read ? 'text-ink-muted' : 'text-ink font-medium'
        )}>
          {label}
        </p>
        {notification.post_title && (
          <p className="text-xs text-ink-subtle mt-0.5 truncate">
            {notification.post_title}
          </p>
        )}
        <p className="text-xs text-ink-subtle mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <span className="size-2 rounded-full bg-primary-500 shrink-0 mt-2" />
      )}
    </Link>
  )
}
