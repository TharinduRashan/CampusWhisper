import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/server'
import PostList from '@/components/posts/PostList'
import PostSkeleton from '@/components/posts/PostSkeleton'
import SortTabs from '@/components/posts/SortTabs'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { Suspense } from 'react'
import type { PostWithMeta, SortMode, Category } from '@/types'
import { PAGE_SIZE } from '@/lib/constants'
import { getAnonLabel } from '@/lib/alias'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: cat } = await (supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single() as any)

  if (!cat) return { title: 'Category Not Found' }
  return {
    title: `${cat.name} — CampusWhisper`,
    description: cat.description ?? `Browse ${cat.name} discussions on CampusWhisper.`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { sort: sortParam } = await searchParams
  const sort = (sortParam as SortMode) || 'hot'

  const supabase = await createClient()
  const profile = await getUserProfile()

  // Fetch category
  const { data: category } = await (supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single() as any)

  if (!category) notFound()
  const cat = category as Category

  // Fetch posts for this category
  const { data: postsRaw } = await (supabase.rpc as any)('get_feed_posts', {
    p_sort: sort,
    p_category_id: cat.id,
    p_limit: PAGE_SIZE,
    p_offset: 0,
  })

  const rawPosts = (postsRaw ?? []) as any[]

  // Batch user votes & bookmarks
  let votesMap: Record<string, number> = {}
  let bookmarksSet = new Set<string>()
  if (profile && rawPosts.length > 0) {
    const ids = rawPosts.map((p: any) => p.id)
    const [{ data: votes }, { data: bookmarks }] = await Promise.all([
      (supabase.from('votes').select('post_id, vote_value').eq('user_id', profile.id).in('post_id', ids) as any),
      (supabase.from('bookmarks').select('post_id').eq('user_id', profile.id).in('post_id', ids) as any),
    ])
    votesMap = Object.fromEntries((votes ?? []).map((v: any) => [v.post_id, v.vote_value]))
    bookmarksSet = new Set((bookmarks ?? []).map((b: any) => b.post_id))
  }

  const posts: PostWithMeta[] = rawPosts.map((p: any) => ({
    ...p,
    user_vote: (votesMap[p.id] ?? 0) as 0 | 1 | -1,
    is_bookmarked: bookmarksSet.has(p.id),
    alias: getAnonLabel(p.id, p.author_id),
  }))

  return (
    <div className="space-y-4">
      {/* Category header */}
      <div
        className="card p-5 border"
        style={{ borderColor: `${cat.color}25` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2">
              <CategoryBadge
                category={cat}
                size="md"
              />
            </div>
            <h1 className="text-xl font-bold" style={{ color: cat.color }}>
              {cat.name}
            </h1>
            {cat.description && (
              <p className="text-sm text-ink-muted mt-1">{cat.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-ink">{cat.post_count.toLocaleString()}</p>
            <p className="text-xs text-ink-subtle">posts</p>
          </div>
        </div>
      </div>

      {/* Sort tabs */}
      <SortTabs currentSort={sort} />

      {/* Posts */}
      <Suspense fallback={<PostSkeleton count={3} />}>
        <PostList
          initialPosts={posts}
          userId={profile?.id}
          isAuthenticated={Boolean(profile)}
          sort={sort}
          categoryId={cat.id}
        />
      </Suspense>
    </div>
  )
}
