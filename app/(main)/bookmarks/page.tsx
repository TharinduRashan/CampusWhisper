import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Bookmark as BookmarkIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/server'
import PostCard from '@/components/posts/PostCard'
import EmptyState from '@/components/ui/EmptyState'
import type { PostWithMeta } from '@/types'
import { getAnonLabel } from '@/lib/alias'

export const metadata: Metadata = {
  title: 'Bookmarks — CampusWhisper',
  description: 'Your saved anonymous campus posts.',
}

export default async function BookmarksPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login?next=/bookmarks')
  }

  const supabase = await createClient()

  // Fetch bookmarked posts
  const { data: bookmarksRaw } = await (supabase
    .from('bookmarks')
    .select(`
      post_id,
      created_at,
      posts (
        *,
        categories(id, name, slug, color, icon)
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false }) as any)

  const postIds = (bookmarksRaw ?? [])
    .map((b: any) => b.posts?.id)
    .filter(Boolean) as string[]

  let votesMap: Record<string, number> = {}
  if (postIds.length > 0) {
    const { data: votes } = await (supabase
      .from('votes')
      .select('post_id, vote_value')
      .eq('user_id', profile.id)
      .in('post_id', postIds) as any)

    votesMap = Object.fromEntries(
      (votes ?? []).map((v: any) => [v.post_id, v.vote_value])
    )
  }

  const posts: PostWithMeta[] = (bookmarksRaw ?? [])
    .filter((b: any) => b.posts && !b.posts.is_deleted)
    .map((b: any) => {
      const p = b.posts
      const cat = p.categories
      return {
        ...p,
        category_name: cat?.name ?? '',
        category_slug: cat?.slug ?? '',
        category_color: cat?.color ?? '#7c3aed',
        category_icon: cat?.icon ?? 'MessageCircle',
        user_vote: (votesMap[p.id] ?? 0) as 0 | 1 | -1,
        is_bookmarked: true,
        alias: getAnonLabel(p.id, p.author_id),
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-2xl bg-primary-600/10">
          <BookmarkIcon className="size-5 text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Bookmarks</h1>
          <p className="text-xs text-ink-subtle">Posts you have saved for later</p>
        </div>
      </div>

      {/* Bookmarked list */}
      {posts.length === 0 ? (
        <EmptyState
          icon={BookmarkIcon}
          title="No bookmarks yet"
          description="Click the bookmark icon on any post to save it here."
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userId={profile.id}
              isAuthenticated={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
