'use client'

import { useState, useTransition } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn, formatScore } from '@/lib/utils'
import type { VoteValue } from '@/types'

interface VoteButtonsProps {
  targetId: string
  targetType: 'post' | 'comment'
  initialScore: number
  initialVote: VoteValue
  isAuthenticated: boolean
  size?: 'sm' | 'md'
  layout?: 'horizontal' | 'vertical'
}

export default function VoteButtons({
  targetId,
  targetType,
  initialScore,
  initialVote,
  isAuthenticated,
  size = 'md',
  layout = 'horizontal',
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<VoteValue>(initialVote)
  const [isPending, startTransition] = useTransition()

  async function handleVote(value: 1 | -1) {
    if (!isAuthenticated) {
      toast.error('Sign in to vote')
      return
    }

    // Optimistic update
    const previousVote = userVote
    const previousScore = score

    const newVote: VoteValue = userVote === value ? 0 : value
    const scoreDelta = newVote - previousVote
    setUserVote(newVote)
    setScore(previousScore + scoreDelta)

    startTransition(async () => {
      try {
        const endpoint =
          targetType === 'post'
            ? `/api/posts/${targetId}/vote`
            : `/api/comments/${targetId}/vote`

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: newVote }),
        })

        if (!res.ok) {
          // Rollback
          setUserVote(previousVote)
          setScore(previousScore)
          const data = await res.json()
          toast.error(data.error?.message ?? 'Failed to vote')
        }
      } catch {
        setUserVote(previousVote)
        setScore(previousScore)
        toast.error('Network error — please try again')
      }
    })
  }

  const isSmall = size === 'sm'
  const isVertical = layout === 'vertical'

  return (
    <div
      className={cn(
        'flex items-center',
        isVertical ? 'flex-col gap-0.5' : 'flex-row gap-1'
      )}
    >
      {/* Upvote */}
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
        className={cn(
          'vote-btn-up',
          userVote === 1 && 'active',
          isSmall ? 'px-2 py-1 text-xs' : '',
          isPending && 'opacity-60 cursor-wait'
        )}
      >
        <ArrowUp className={cn(isSmall ? 'size-3.5' : 'size-4')} />
      </button>

      {/* Score */}
      <span
        className={cn(
          'font-bold tabular-nums min-w-[2ch] text-center select-none',
          isSmall ? 'text-xs' : 'text-sm',
          score > 0 && 'text-upvote',
          score < 0 && 'text-downvote',
          score === 0 && 'text-ink-subtle'
        )}
      >
        {formatScore(score)}
      </span>

      {/* Downvote */}
      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
        className={cn(
          'vote-btn-down',
          userVote === -1 && 'active',
          isSmall ? 'px-2 py-1 text-xs' : '',
          isPending && 'opacity-60 cursor-wait'
        )}
      >
        <ArrowDown className={cn(isSmall ? 'size-3.5' : 'size-4')} />
      </button>
    </div>
  )
}
