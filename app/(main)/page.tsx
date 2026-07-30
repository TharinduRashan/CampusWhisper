import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/server'
import PostList from '@/components/posts/PostList'
import PostSkeleton from '@/components/posts/PostSkeleton'
import SortTabs from '@/components/posts/SortTabs'
import { Suspense } from 'react'
import type { PostWithMeta, SortMode } from '@/types'
import { PAGE_SIZE } from '@/lib/constants'
import { getAnonLabel } from '@/lib/alias'

export const metadata: Metadata = {
  title: 'Home — CampusWhisper',
  description: 'Anonymous campus discussions for university students.',
}

interface HomePageProps {
  searchParams: Promise<{ sort?: string }>
}

async function getFeedPosts(
  sort: SortMode,
  userId?: string
): Promise<PostWithMeta[]> {
  const supabase = await createClient()

  const { data: posts } = await (supabase.rpc as any)('get_feed_posts', {
    p_sort: sort,
    p_limit: PAGE_SIZE,
    p_offset: 0,
  })

  if (!posts || (posts as any[]).length === 0) return []

  // Batch fetch user votes and bookmarks if authenticated
  let votesMap: Record<string, number> = {}
  let bookmarksSet: Set<string> = new Set()

  if (userId) {
    const postIds = (posts as any[]).map((p: { id: string }) => p.id)
    const [{ data: votes }, { data: bookmarks }] = await Promise.all([
      (supabase
        .from('votes')
        .select('post_id, vote_value')
        .eq('user_id', userId)
        .in('post_id', postIds) as any),
      (supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds) as any),
    ])
    votesMap = Object.fromEntries(
      (votes ?? []).map((v: { post_id: string; vote_value: number }) => [v.post_id, v.vote_value])
    )
    bookmarksSet = new Set((bookmarks ?? []).map((b: { post_id: string }) => b.post_id))
  }

  return posts.map((p: any) => ({
    ...p,
    user_vote: (votesMap[p.id] ?? 0) as 0 | 1 | -1,
    is_bookmarked: bookmarksSet.has(p.id),
    alias: getAnonLabel(p.id, p.author_id),
  }))
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const sort = (params.sort as SortMode) || 'hot'
  const profile = await getUserProfile()
  const posts = await getFeedPosts(sort, profile?.id)

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Home</h1>
          <p className="text-xs text-ink-subtle mt-0.5">Anonymous campus discussions</p>
        </div>
        {/* Desktop create button */}
        <Link
          href={profile ? '/create' : '/login?next=/create'}
          className="btn-primary btn-sm hidden md:inline-flex"
        >
          <Plus className="size-3.5" />
          New Post
        </Link>
      </div>

      {/* Sort tabs */}
      <SortTabs currentSort={sort} />

      {/* Feed */}
      <Suspense fallback={<PostSkeleton count={4} />}>
        <PostList
          initialPosts={posts}
          userId={profile?.id}
          isAuthenticated={Boolean(profile)}
          sort={sort}
        />
      </Suspense>
    </div>
  )
}
