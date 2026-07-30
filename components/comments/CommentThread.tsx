import CommentCard from '@/components/comments/CommentCard'
import CommentSortSelect from '@/components/comments/CommentSortSelect'
import CommentForm from '@/components/comments/CommentForm'
import EmptyState from '@/components/ui/EmptyState'
import { MessageCircle } from 'lucide-react'
import type { CommentWithMeta, CommentSort } from '@/types'

interface CommentThreadProps {
  comments: CommentWithMeta[]
  postId: string
  postAuthorId: string
  commentCount: number
  userId?: string
  isAuthenticated: boolean
  currentSort: CommentSort
}

export default function CommentThread({
  comments,
  postId,
  postAuthorId,
  commentCount,
  userId,
  isAuthenticated,
  currentSort,
}: CommentThreadProps) {
  return (
    <section id="comments" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink flex items-center gap-2">
          <MessageCircle className="size-4 text-ink-muted" />
          {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
        </h2>
        <CommentSortSelect currentSort={currentSort} />
      </div>

      {/* New comment form */}
      <div className="card p-4">
        <CommentForm
          postId={postId}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Comment list */}
      {comments.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No comments yet"
          description="Be the first to share your thoughts anonymously."
        />
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              userId={userId}
              isAuthenticated={isAuthenticated}
              depth={0}
            />
          ))}
        </div>
      )}
    </section>
  )
}
