'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, EyeOff, XCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { timeAgo } from '@/lib/utils'
import type { ReportWithTarget } from '@/types'
import { cn } from '@/lib/utils'

interface ReportRowProps {
  report: ReportWithTarget
}

export default function ReportRow({ report }: ReportRowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(report.status)

  async function handleAction(action: 'dismiss' | 'hide') {
    if (isPending) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/reports/${report.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
        if (!res.ok) throw new Error('Failed to update report status')

        const newStatus = action === 'dismiss' ? 'dismissed' : 'actioned'
        setStatus(newStatus)
        toast.success(action === 'dismiss' ? 'Report dismissed' : 'Content hidden & report actioned')
        router.refresh()
      } catch {
        toast.error('Failed to perform action')
      }
    })
  }

  const targetTitle = report.post?.title ?? report.comment?.body ?? 'Unknown Content'
  const isPendingStatus = status === 'pending'

  return (
    <div className={cn(
      'card p-4 space-y-3 transition-all duration-200',
      isPendingStatus ? 'border-card-border' : 'opacity-70 bg-card/50'
    )}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            'badge text-xs font-semibold px-2 py-0.5 border',
            report.target_type === 'post'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
          )}>
            {report.target_type.toUpperCase()}
          </span>
          <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2 py-0.5">
            {report.reason.replace('_', ' ')}
          </span>
          <span className="text-xs text-ink-subtle">
            {timeAgo(report.created_at)}
          </span>
        </div>

        {/* Status badge */}
        <span className={cn(
          'text-xs font-semibold capitalize px-2 py-0.5 rounded-md',
          status === 'pending' && 'bg-amber-500/15 text-amber-400',
          status === 'dismissed' && 'bg-zinc-500/15 text-zinc-400',
          status === 'actioned' && 'bg-green-500/15 text-green-400'
        )}>
          {status}
        </span>
      </div>

      {/* Target Content Snippet */}
      <div className="p-3 rounded-xl bg-surface border border-card-border/50 space-y-1">
        <p className="text-xs text-ink-subtle font-medium">Reported Content Snippet:</p>
        <p className="text-sm font-semibold text-ink line-clamp-2 leading-snug">
          {targetTitle}
        </p>
      </div>

      {/* Report Details if present */}
      {report.details && (
        <p className="text-xs text-ink-muted italic">
          &quot;{report.details}&quot;
        </p>
      )}

      {/* Action buttons */}
      {isPendingStatus && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-card-border/40">
          {report.target_type === 'post' && report.post?.id && (
            <Link
              href={`/post/${report.post.id}`}
              target="_blank"
              className="btn-ghost btn-xs text-ink-muted hover:text-ink mr-auto"
            >
              <ExternalLink className="size-3" />
              View Post
            </Link>
          )}

          <button
            onClick={() => handleAction('dismiss')}
            disabled={isPending}
            className="btn-secondary btn-xs text-ink-muted hover:text-ink"
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : <XCircle className="size-3 text-zinc-400" />}
            Dismiss Report
          </button>

          <button
            onClick={() => handleAction('hide')}
            disabled={isPending}
            className="btn-danger btn-xs"
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : <EyeOff className="size-3" />}
            Hide Content
          </button>
        </div>
      )}
    </div>
  )
}
