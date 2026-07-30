'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { SORT_OPTIONS } from '@/lib/constants'
import type { SortMode } from '@/types'

interface SortTabsProps {
  currentSort: SortMode
}

export default function SortTabs({ currentSort }: SortTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleSort(sort: SortMode) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
      {SORT_OPTIONS.map((option) => {
        const isActive = currentSort === option.value
        return (
          <button
            key={option.value}
            onClick={() => handleSort(option.value)}
            disabled={isPending}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap',
              'transition-all duration-150 shrink-0',
              isActive
                ? 'bg-primary-600 text-white shadow-glow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-card'
            )}
          >
            {option.shortLabel}
          </button>
        )
      })}
    </div>
  )
}
