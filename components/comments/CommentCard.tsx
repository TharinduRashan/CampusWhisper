'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, MessageCircle, ChevronDown, ChevronUp, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn, timeAgo, formatFullDate } from '@/lib/utils'
import { getAnonLabel, getAliasColor } from '@/lib/alias'
import VoteButtons from '@/components/votes/VoteButtons'
import CommentForm from '@/components/comments/CommentForm'
import ReportModal from '@/components/ui/ReportModal'
import type { CommentWithMeta } from '@/types'

interface CommentCardProps {
  comment: CommentWithMeta
  postId: string
  postAuthorId: string
  userId?: string
  isAuthenticated: boolean
  depth?: number
}

export default function CommentCard({
  comment,
  postId,
  postAuthorId,
  userId,
  isAuthenticated,
  depth = 0,
}: CommentCardProps) {
  const router = useRouter()
  const [showReply, setShowReply] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const alias = getAnonLabel(postId, comment.author_id, comment.author_id === postAuthorId)
  const aliasColor = getAliasColor(postId, comment.author_id)
  const isAuthor = Boolean(userId && userId === comment.author_id)
  const isOP = comment.author_id === postAuthorId
  const maxDepth = 5

  async function handleDeleteComment() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? 'Failed to delete comment')

      toast.success('Comment deleted')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete comment')
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(false)
    }
  }

  if (comment.is_deleted) {
    return (
      <div className={cn('pl-4 border-l border-card-border/40', depth > 0 && 'ml-4')}>
        <p className="text-sm italic text-ink-subtle py-2">[deleted]</p>
        {comment.replies?.length > 0 && (
          <div className="space-y-3 mt-3">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                postId={postId}
                postAuthorId={postAuthorId}
                userId={userId}
                isAuthenticated={isAuthenticated}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div
        id={`comment-${comment.id}`}
        className={cn(
          'group',
          depth > 0 && 'pl-3 sm:pl-4 border-l-2 border-card-border/60 ml-1.5 sm:ml-2 hover:border-primary-600/40 transition-colors'
        )}
      >
        {/* Comment header */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={cn('alias-tag text-[10px]', aliasColor)}>
            {alias}
          </span>
          {isOP && (
            <span className="text-[10px] font-bold text-primary-400 bg-primary-600/10 px-1.5 py-0.5 rounded-md">
              OP
            </span>
          )}
          {isAuthor && !isOP && (
            <span className="text-[10px] text-ink-subtle">(you)</span>
          )}
          <span
            title={formatFullDate(comment.created_at)}
            className="text-xs text-ink-subtle cursor-default"
          >
            {timeAgo(comment.created_at)}
          </span>

          {/* Collapse toggle for comments with replies */}
          {comment.replies?.length > 0 && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="ml-auto text-ink-subtle hover:text-ink transition-colors p-1"
              aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
            >
              {collapsed
                ? <ChevronDown className="size-3.5" />
                : <ChevronUp className="size-3.5" />
              }
            </button>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Body */}
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap break-words">
              {comment.body}
            </p>

            {/* Footer actions */}
            <div className="flex items-center gap-1 mt-2 pt-1">
              <VoteButtons
                targetId={comment.id}
                targetType="comment"
                initialScore={comment.score}
                initialVote={comment.user_vote}
                isAuthenticated={isAuthenticated}
                size="sm"
              />

              {isAuthenticated && depth < maxDepth && (
                <button
                  onClick={() => setShowReply((s) => !s)}
                  className="vote-btn text-xs text-ink-subtle hover:text-ink ml-1"
                >
                  <MessageCircle className="size-3.5" />
                  Reply
                </button>
              )}

              {/* Comment author delete option with double-check */}
              {isAuthor && (
                deleteConfirm ? (
                  <div className="flex items-center gap-1.5 ml-2 text-xs bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg animate-slide-down">
                    <span className="text-red-400 font-medium text-[11px]">Delete?</span>
                    <button
                      onClick={handleDeleteComment}
                      disabled={isDeleting}
                      className="px-2 py-0.5 rounded bg-red-600 text-white font-semibold text-[11px] hover:bg-red-500 transition-colors"
                    >
                      {isDeleting ? <Loader2 className="size-3 animate-spin" /> : 'Yes'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-2 py-0.5 rounded bg-card border border-card-border text-ink-muted hover:text-ink text-[11px] transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="vote-btn text-xs text-ink-subtle hover:text-red-400 ml-1"
                    aria-label="Delete comment"
                    title="Delete comment"
                  >
                    <Trash2 className="size-3.5 text-red-400/70 hover:text-red-400" />
                  </button>
                )
              )}

              <button
                onClick={() => setReportOpen(true)}
                className="vote-btn text-xs text-ink-subtle hover:text-red-400 ml-auto"
                aria-label="Report comment"
              >
                <Flag className="size-3" />
              </button>
            </div>

            {/* Reply form */}
            {showReply && (
              <div className="mt-3 animate-slide-down">
                <CommentForm
                  postId={postId}
                  parentCommentId={comment.id}
                  isAuthenticated={isAuthenticated}
                  placeholder={`Reply to ${alias}…`}
                  autoFocus
                  onCancel={() => setShowReply(false)}
                  onSuccess={() => setShowReply(false)}
                />
              </div>
            )}
          </>
        )}

        {/* Nested replies */}
        {!collapsed && comment.replies?.length > 0 && (
          <div className="space-y-4 mt-4">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                postId={postId}
                postAuthorId={postAuthorId}
                userId={userId}
                isAuthenticated={isAuthenticated}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetId={comment.id}
        targetType="comment"
      />
    </>
  )
}
