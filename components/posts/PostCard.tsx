'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  MessageCircle, Bookmark, BookmarkCheck, Flag, MoreHorizontal, Share2, Trash2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn, timeAgo, truncate } from '@/lib/utils'
import { getAnonLabel, getAliasColor } from '@/lib/alias'
import VoteButtons from '@/components/votes/VoteButtons'
import CategoryBadge from '@/components/ui/CategoryBadge'
import ReportModal from '@/components/ui/ReportModal'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import type { PostWithMeta } from '@/types'

interface PostCardProps {
  post: PostWithMeta
  userId?: string
  isAuthenticated: boolean
  showFullBody?: boolean
  onDeleted?: () => void
}

export default function PostCard({
  post,
  userId,
  isAuthenticated,
  showFullBody = false,
  onDeleted,
}: PostCardProps) {
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const alias = getAnonLabel(post.id, post.author_id)
  const aliasColor = getAliasColor(post.id, post.author_id)
  const isAuthor = Boolean(userId && userId === post.author_id)
  const bodyText = post.body ? (showFullBody ? post.body : truncate(post.body, 280)) : null

  if (isDeleted) return null

  async function handleBookmark() {
    if (!isAuthenticated) { toast.error('Sign in to save posts'); return }
    setIsBookmarking(true)
    const prev = bookmarked
    setBookmarked(!bookmarked)
    try {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, { method: 'POST' })
      if (!res.ok) { setBookmarked(prev); toast.error('Failed to update bookmark') }
      else toast.success(prev ? 'Removed from bookmarks' : 'Saved to bookmarks')
    } catch {
      setBookmarked(prev)
    } finally {
      setIsBookmarking(false)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`
    try {
      if (navigator.share) await navigator.share({ title: post.title, url })
      else { await navigator.clipboard.writeText(url); toast.success('Link copied!') }
    } catch { /* user cancelled */ }
  }

  return (
    <>
      <article className="card card-hover group animate-slide-up">
        <div className="p-5">
          {/* Header: category + time + alias */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge
                category={{
                  name: post.category_name,
                  slug: post.category_slug,
                  color: post.category_color,
                  icon: post.category_icon,
                }}
              />
              <span className="text-xs text-ink-subtle">
                {timeAgo(post.created_at)}
              </span>
            </div>

            {/* Alias tag */}
            <span className={cn('alias-tag text-[10px] shrink-0', aliasColor)}>
              {isAuthor ? 'OP (You)' : alias.split(' ')[1]}
            </span>
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`} className="block group/title">
            <h2 className="text-base font-semibold text-ink leading-snug group-hover/title:text-primary-300 transition-colors duration-150 line-clamp-3">
              {post.title}
            </h2>
          </Link>

          {/* Body preview */}
          {bodyText && (
            <p className="text-sm text-ink-muted mt-2 leading-relaxed line-clamp-3">
              {bodyText}
            </p>
          )}

          {/* Image */}
          {post.image_url && (
            <Link href={`/post/${post.id}`} className="block mt-3">
              <div className="relative rounded-xl overflow-hidden border border-card-border aspect-video">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 640px"
                />
              </div>
            </Link>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-card-border/50">
            {/* Left: votes + comments */}
            <div className="flex items-center gap-1">
              <VoteButtons
                targetId={post.id}
                targetType="post"
                initialScore={post.score}
                initialVote={post.user_vote}
                isAuthenticated={isAuthenticated}
                size="sm"
              />
              <Link
                href={`/post/${post.id}#comments`}
                className="vote-btn ml-1 text-ink-subtle hover:text-ink"
              >
                <MessageCircle className="size-3.5" />
                <span className="text-xs">{post.comment_count}</span>
              </Link>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-0.5">
              {/* Share */}
              <button
                onClick={handleShare}
                className="vote-btn text-ink-subtle hover:text-ink"
                aria-label="Share post"
              >
                <Share2 className="size-3.5" />
              </button>

              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={cn(
                  'vote-btn',
                  bookmarked ? 'text-primary-400' : 'text-ink-subtle hover:text-primary-400'
                )}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
              >
                {bookmarked
                  ? <BookmarkCheck className="size-3.5" />
                  : <Bookmark className="size-3.5" />
                }
              </button>

              {/* Options menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="vote-btn text-ink-subtle hover:text-ink"
                  aria-label="More options"
                >
                  <MoreHorizontal className="size-3.5" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 bottom-full mb-1 z-20 w-40 bg-card border border-card-border rounded-xl shadow-card py-1 animate-scale-in">
                      {isAuthor && (
                        <button
                          onClick={() => { setMenuOpen(false); setDeleteOpen(true) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                        >
                          <Trash2 className="size-3.5" />
                          Delete Post
                        </button>
                      )}
                      <button
                        onClick={() => { setMenuOpen(false); setReportOpen(true) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink-muted hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <Flag className="size-3.5" />
                        Report
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetId={post.id}
        targetType="post"
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          setIsDeleted(true)
          if (onDeleted) onDeleted()
        }}
        postId={post.id}
        title={post.title}
      />
    </>
  )
}
