'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks'

interface SearchBarProps {
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

export default function SearchBar({
  className,
  placeholder = 'Search campus discussions…',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    })
  }

  function handleClear() {
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative flex items-center">
        {/* Search icon / spinner */}
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Loader2 className="size-4 text-primary-400 animate-spin" />
          ) : (
            <Search className="size-4 text-ink-subtle" />
          )}
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className={cn(
            'input pl-10 pr-10',
            'bg-surface-50 border-card-border',
            'focus:bg-card focus:ring-2 focus:ring-primary-500',
            'transition-all duration-200'
          )}
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-ink-subtle hover:text-ink transition-colors"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </form>
  )
}
