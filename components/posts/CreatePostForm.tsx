'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  Loader2, AlertCircle, Image as ImageIcon, X, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LIMITS, CATEGORIES } from '@/lib/constants'
import ImageUpload from '@/components/ui/ImageUpload'

export default function CreatePostForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [showImage, setShowImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = title.trim().length >= 3 && categoryId !== null
  const titleRemaining = LIMITS.POST_TITLE - title.length
  const bodyRemaining = LIMITS.POST_BODY - body.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) { setError('Title (min 3 chars) and category are required.'); return }
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            body: body.trim() || undefined,
            category_id: categoryId,
            image_url: imageUrl || undefined,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error?.message ?? 'Failed to create post')

        toast.success('Post created! 🎉')
        router.push(`/post/${data.post.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  const selectedCategory = CATEGORIES.find((c) => {
    // We'll resolve after category IDs are loaded from DB
    return false
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category selector */}
      <div className="space-y-1.5">
        <label htmlFor="category" className="block text-sm font-medium text-ink-muted">
          Category <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            id="category"
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className={cn(
              'input appearance-none pr-10 cursor-pointer',
              !categoryId && 'text-ink-subtle'
            )}
            disabled={isPending}
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-subtle pointer-events-none" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="title" className="block text-sm font-medium text-ink-muted">
            Title <span className="text-red-400">*</span>
          </label>
          <span className={cn(
            'text-xs',
            titleRemaining < 50 ? 'text-amber-400' : 'text-ink-subtle',
            titleRemaining < 0 && 'text-red-400'
          )}>
            {titleRemaining}
          </span>
        </div>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={LIMITS.POST_TITLE}
          className="input"
          disabled={isPending}
          required
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="body" className="block text-sm font-medium text-ink-muted">
            Body{' '}
            <span className="text-ink-subtle font-normal">(optional)</span>
          </label>
          <span className={cn(
            'text-xs',
            bodyRemaining < 500 ? 'text-amber-400' : 'text-ink-subtle'
          )}>
            {bodyRemaining.toLocaleString()}
          </span>
        </div>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add more context, details, or just let it all out…"
          rows={5}
          maxLength={LIMITS.POST_BODY}
          className="textarea"
          disabled={isPending}
        />
      </div>

      {/* Image toggle */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowImage((s) => !s)}
          className={cn(
            'flex items-center gap-2 text-sm font-medium transition-colors',
            showImage ? 'text-primary-400' : 'text-ink-muted hover:text-ink'
          )}
        >
          {showImage ? <X className="size-4" /> : <ImageIcon className="size-4" />}
          {showImage ? 'Remove image' : 'Add image'}
        </button>

        {showImage && (
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            className="animate-slide-down"
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Anonymous note */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-600/5 border border-primary-600/10">
        <span className="text-lg">👻</span>
        <p className="text-xs text-ink-muted">
          This post will be <strong className="text-ink">completely anonymous</strong>.
          Your identity is never revealed.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !isValid}
        className="btn-primary btn-lg w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Posting anonymously…
          </>
        ) : (
          '🚀 Post Anonymously'
        )}
      </button>
    </form>
  )
}
