'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Share2, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import CategoryBadge from '@/components/ui/CategoryBadge'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { timeAgo, formatFullDate, cn } from '@/lib/utils'
import { getAnonLabel, getAliasColor } from '@/lib/alias'

interface PostDetailHeaderProps {
  post: {
    id: string
    title: string
    author_id: string
    created_at: string
    category_name: string
    category_slug: string
    category_color: string
    category_icon: string
  }
  userId?: string
}

export default function PostDetailHeader({ post, userId }: PostDetailHeaderProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isAuthor = Boolean(userId && userId === post.author_id)
  const alias = getAnonLabel(post.id, post.author_id)
  const aliasColor = getAliasColor(post.id, post.author_id)

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: post.title, url })
      else { await navigator.clipboard.writeText(url); toast.success('Link copied!') }
    } catch { /* user cancelled */ }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-card-border/50">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge
            category={{
              name: post.category_name,
              slug: post.category_slug,
              color: post.category_color,
              icon: post.category_icon,
            }}
            size="md"
          />
          <span
            className={cn('alias-tag text-[10px]', aliasColor)}
            title="Anonymous poster"
          >
            {isAuthor ? 'OP (You)' : alias.split(' ')[1]}
          </span>
          <span
            className="text-xs text-ink-subtle flex items-center gap-1"
            title={formatFullDate(post.created_at)}
          >
            <Calendar className="size-3" />
            {timeAgo(post.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            className="btn-ghost btn-sm text-ink-subtle hover:text-ink"
            aria-label="Share post"
          >
            <Share2 className="size-3.5" />
            <span className="hidden xs:inline text-xs">Share</span>
          </button>

          {isAuthor && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="btn-danger btn-sm text-xs flex items-center gap-1"
              aria-label="Delete post"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          router.push('/')
        }}
        postId={post.id}
        title={post.title}
      />
    </>
  )
}
