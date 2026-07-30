'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2 } from 'lucide-react'
import PostCard from '@/components/posts/PostCard'
import PostSkeleton from '@/components/posts/PostSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import { MessageCircle } from 'lucide-react'
import type { PostWithMeta, SortMode } from '@/types'
import { PAGE_SIZE } from '@/lib/constants'

interface PostListProps {
  initialPosts: PostWithMeta[]
  userId?: string
  isAuthenticated: boolean
  sort: SortMode
  categoryId?: number
}

export default function PostList({
  initialPosts,
  userId,
  isAuthenticated,
  sort,
  categoryId,
}: PostListProps) {
  const [posts, setPosts] = useState<PostWithMeta[]>(initialPosts)
  const [offset, setOffset] = useState(initialPosts.length)
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(false)

  // Reset when sort or category changes
  useEffect(() => {
    setPosts(initialPosts)
    setOffset(initialPosts.length)
    setHasMore(initialPosts.length >= PAGE_SIZE)
  }, [initialPosts, sort, categoryId])

  const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' })

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        sort,
        offset: String(offset),
        limit: String(PAGE_SIZE),
      })
      if (categoryId) params.set('categoryId', String(categoryId))

      const res = await fetch(`/api/posts?${params}`)
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = await res.json()

      const newPosts: PostWithMeta[] = data.posts ?? []
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id))
        return [...prev, ...newPosts.filter((p) => !ids.has(p.id))]
      })
      setOffset((prev) => prev + newPosts.length)
      setHasMore(data.hasMore ?? newPosts.length >= PAGE_SIZE)
    } catch (err) {
      console.error('loadMore error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, offset, sort, categoryId])

  useEffect(() => {
    if (inView) loadMore()
  }, [inView, loadMore])

  if (posts.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No posts yet"
        description="Be the first to start a discussion in this category."
      />
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          userId={userId}
          isAuthenticated={isAuthenticated}
        />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={ref} className="py-2 flex justify-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-ink-subtle text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading more…
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-xs text-ink-subtle py-4">
            You&apos;ve reached the end 🎉
          </p>
        )}
      </div>
    </div>
  )
}
