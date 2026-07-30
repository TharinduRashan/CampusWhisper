'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { timeAgo, formatScore } from '@/lib/utils'
import CategoryBadge from '@/components/ui/CategoryBadge'

interface AdminPostRowProps {
  post: any
}

export default function AdminPostRow({ post }: AdminPostRowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isHidden, setIsHidden] = useState(post.is_hidden)
  const [isDeleted, setIsDeleted] = useState(post.is_deleted)

  const cat = post.categories

  async function handleToggleHide() {
    startTransition(async () => {
      try {
        const nextState = !isHidden
        const res = await fetch(`/api/admin/posts/${post.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_hidden: nextState }),
        })
        if (!res.ok) throw new Error('Failed to update post')

        setIsHidden(nextState)
        toast.success(nextState ? 'Post hidden' : 'Post unhidden')
        router.refresh()
      } catch {
        toast.error('Failed to update post')
      }
    })
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to soft delete this post?')) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete post')

        setIsDeleted(true)
        toast.success('Post soft-deleted')
        router.refresh()
      } catch {
        toast.error('Failed to delete post')
      }
    })
  }

  if (isDeleted) {
    return (
      <div className="card p-4 opacity-50 bg-card/40 flex items-center justify-between text-xs text-ink-subtle italic">
        <span>Post #{post.id.slice(0, 8)} has been deleted.</span>
        <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
          DELETED
        </span>
      </div>
    )
  }

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {cat && (
            <CategoryBadge
              category={{ name: cat.name, slug: cat.slug, color: cat.color, icon: cat.icon }}
              size="sm"
            />
          )}
          {isHidden && (
            <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5">
              HIDDEN
            </span>
          )}
          <span className="text-xs text-ink-subtle">
            {timeAgo(post.created_at)}
          </span>
        </div>

        <Link href={`/post/${post.id}`} target="_blank" className="font-semibold text-sm text-ink hover:text-primary-300 transition-colors line-clamp-1">
          {post.title}
        </Link>

        <div className="flex items-center gap-4 text-xs text-ink-subtle">
          <span>Score: {formatScore(post.score)}</span>
          <span>Comments: {post.comment_count}</span>
          <span>Reports: {post.report_count}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href={`/post/${post.id}`}
          target="_blank"
          className="btn-ghost btn-xs text-ink-muted hover:text-ink"
        >
          <ExternalLink className="size-3" /> View
        </Link>

        <button
          onClick={handleToggleHide}
          disabled={isPending}
          className="btn-secondary btn-xs text-ink-muted hover:text-ink"
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : isHidden ? (
            <>
              <Eye className="size-3 text-emerald-400" /> Unhide
            </>
          ) : (
            <>
              <EyeOff className="size-3 text-amber-400" /> Hide
            </>
          )}
        </button>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="btn-danger btn-xs"
        >
          {isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
        </button>
      </div>
    </div>
  )
}
