'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { ChevronDown } from 'lucide-react'
import { COMMENT_SORT_OPTIONS } from '@/lib/constants'
import type { CommentSort } from '@/types'
import { cn } from '@/lib/utils'

interface CommentSortSelectProps {
  currentSort: CommentSort
}

export default function CommentSortSelect({ currentSort }: CommentSortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(sort: CommentSort) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('commentSort', sort)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}#comments`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-subtle font-medium">Sort by:</span>
      <div className="flex items-center gap-1">
        {COMMENT_SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            disabled={isPending}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              currentSort === opt.value
                ? 'bg-card border border-card-border text-ink'
                : 'text-ink-muted hover:text-ink hover:bg-card'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
