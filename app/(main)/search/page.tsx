import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/server'
import SearchBar from '@/components/ui/SearchBar'
import PostCard from '@/components/posts/PostCard'
import PostSkeleton from '@/components/posts/PostSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import CategoryBadge from '@/components/ui/CategoryBadge'
import type { PostWithMeta } from '@/types'
import { getAnonLabel } from '@/lib/alias'
import { PAGE_SIZE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Search — CampusWhisper',
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>
}

async function SearchResults({ query, userId, isAuthenticated }: {
  query: string
  userId?: string
  isAuthenticated: boolean
}) {
  if (!query.trim()) return null

  const supabase = await createClient()
  const { data: resultsRaw } = await (supabase.rpc as any)('search_posts', {
    p_query: query,
    p_limit: PAGE_SIZE,
    p_offset: 0,
  })

  const results = (resultsRaw ?? []) as any[]

  // Batch votes/bookmarks
  let votesMap: Record<string, number> = {}
  let bookmarksSet = new Set<string>()
  if (userId && results.length > 0) {
    const ids = results.map((p: any) => p.id)
    const [{ data: votes }, { data: bookmarks }] = await Promise.all([
      (supabase.from('votes').select('post_id, vote_value').eq('user_id', userId).in('post_id', ids) as any),
      (supabase.from('bookmarks').select('post_id').eq('user_id', userId).in('post_id', ids) as any),
    ])
    votesMap = Object.fromEntries((votes ?? []).map((v: any) => [v.post_id, v.vote_value]))
    bookmarksSet = new Set((bookmarks ?? []).map((b: any) => b.post_id))
  }

  const posts: PostWithMeta[] = results.map((p: any) => ({
    ...p,
    user_vote: (votesMap[p.id] ?? 0) as 0 | 1 | -1,
    is_bookmarked: bookmarksSet.has(p.id),
    alias: getAnonLabel(p.id, p.author_id),
  }))

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={SearchIcon}
        title={`No results for "${query}"`}
        description="Try different keywords or browse by category."
      />
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">
        {posts.length} result{posts.length !== 1 ? 's' : ''} for{' '}
        <span className="text-ink font-semibold">&quot;{query}&quot;</span>
      </p>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          userId={userId}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const profile = await getUserProfile()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink mb-1">Search</h1>
        <p className="text-xs text-ink-subtle">Search across all campus discussions</p>
      </div>

      {/* Expanded search bar */}
      <SearchBar
        placeholder="Search posts, topics, categories…"
        autoFocus={!query}
      />

      {/* Results */}
      {query ? (
        <Suspense fallback={<PostSkeleton count={3} />}>
          <SearchResults
            query={query}
            userId={profile?.id}
            isAuthenticated={Boolean(profile)}
          />
        </Suspense>
      ) : (
        <EmptyState
          icon={SearchIcon}
          title="Search CampusWhisper"
          description="Find posts by title, content, or topic."
        />
      )}
    </div>
  )
}
