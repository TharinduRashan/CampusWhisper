'use client'

import { useState, useTransition } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LIMITS } from '@/lib/constants'
import { toast } from 'react-hot-toast'

interface CommentFormProps {
  postId: string
  parentCommentId?: string
  isAuthenticated: boolean
  placeholder?: string
  onSuccess?: () => void
  onCancel?: () => void
  autoFocus?: boolean
}

export default function CommentForm({
  postId,
  parentCommentId,
  isAuthenticated,
  placeholder = 'Share your thoughts anonymously…',
  onSuccess,
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isReply = Boolean(parentCommentId)
  const remaining = LIMITS.COMMENT_BODY - body.length

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-card-border">
        <span className="text-2xl">👻</span>
        <p className="text-sm text-ink-muted">
          <a href="/login" className="text-primary-400 hover:underline font-medium">
            Sign in
          </a>{' '}
          to join the discussion anonymously.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) { setError('Comment cannot be empty.'); return }
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post_id: postId,
            parent_comment_id: parentCommentId,
            body: trimmed,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error?.message ?? 'Failed to post comment')

        setBody('')
        toast.success(isReply ? 'Reply posted! 💬' : 'Comment posted! 💬')
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to post comment')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          rows={isReply ? 2 : 3}
          maxLength={LIMITS.COMMENT_BODY}
          autoFocus={autoFocus}
          disabled={isPending}
          className="textarea"
        />
        <span className={cn(
          'absolute bottom-2 right-3 text-xs',
          remaining < 100 ? 'text-amber-400' : 'text-ink-subtle'
        )}>
          {remaining}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost btn-sm text-xs"
            disabled={isPending}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="btn-primary btn-sm text-xs"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            isReply ? '💬 Reply' : '💬 Comment'
          )}
        </button>
      </div>
    </form>
  )
}
