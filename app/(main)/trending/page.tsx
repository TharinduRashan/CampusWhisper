import type { Metadata } from 'next'
import { TrendingUp, Flame, MessageCircle, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/server'
import PostCard from '@/components/posts/PostCard'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { timeAgo, formatScore } from '@/lib/utils'
import { getAnonLabel } from '@/lib/alias'
import type { PostWithMeta } from '@/types'

export const metadata: Metadata = {
  title: 'Trending — CampusWhisper',
  description: 'The hottest campus discussions right now.',
}

export const revalidate = 300 // Revalidate every 5 minutes

export default async function TrendingPage() {
  const supabase = await createClient()
  const profile = await getUserProfile()

  // Fetch trending posts via RPC
  const { data: trendingRaw } = await (supabase.rpc as any)('get_trending_posts', {
    p_limit: 20,
  })

  const trending = (trendingRaw ?? []) as any[]

  // Batch user votes
  let votesMap: Record<string, number> = {}
  let bookmarksSet = new Set<string>()
  if (profile && trending.length > 0) {
    const ids = trending.map((p: any) => p.id)
    const [{ data: votes }, { data: bookmarks }] = await Promise.all([
      (supabase.from('votes').select('post_id, vote_value').eq('user_id', profile.id).in('post_id', ids) as any),
      (supabase.from('bookmarks').select('post_id').eq('user_id', profile.id).in('post_id', ids) as any),
    ])
    votesMap = Object.fromEntries((votes ?? []).map((v: any) => [v.post_id, v.vote_value]))
    bookmarksSet = new Set((bookmarks ?? []).map((b: any) => b.post_id))
  }

  const posts: PostWithMeta[] = trending.map((p: any, i: number) => ({
    ...p,
    user_vote: (votesMap[p.id] ?? 0) as 0 | 1 | -1,
    is_bookmarked: bookmarksSet.has(p.id),
    alias: getAnonLabel(p.id, p.author_id),
  }))

  const [heroPost, ...rest] = posts
  const top3 = rest.slice(0, 3)
  const remainder = rest.slice(3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-2xl bg-orange-500/10">
          <TrendingUp className="size-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Trending</h1>
          <p className="text-xs text-ink-subtle">Hottest discussions in the last 7 days</p>
        </div>
      </div>

      {/* Hero post */}
      {heroPost && (
        <Link href={`/post/${heroPost.id}`} className="block group">
          <article className="card card-hover overflow-hidden relative">
            {heroPost.image_url && (
              <div className="relative aspect-[16/6] w-full">
                <Image src={heroPost.image_url} alt={heroPost.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
              </div>
            )}
            <div className={`p-5 ${heroPost.image_url ? '-mt-16 relative z-10' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full">
                  <Flame className="size-3" /> #1 Trending
                </span>
                <CategoryBadge
                  category={{ name: heroPost.category_name, slug: heroPost.category_slug, color: heroPost.category_color, icon: heroPost.category_icon }}
                />
              </div>
              <h2 className="text-lg font-bold text-ink leading-snug group-hover:text-primary-300 transition-colors line-clamp-2">
                {heroPost.title}
              </h2>
              {heroPost.body && (
                <p className="text-sm text-ink-muted mt-1 line-clamp-2">{heroPost.body}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-ink-subtle">
                <span className="font-semibold text-upvote">▲ {formatScore(heroPost.score)}</span>
                <span className="flex items-center gap-1"><MessageCircle className="size-3" />{heroPost.comment_count}</span>
                <span>{timeAgo(heroPost.created_at)}</span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ink-muted mb-3 flex items-center gap-1.5">
            <Zap className="size-3.5 text-primary-400" /> Hot right now
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {top3.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`} className="card card-hover p-4 group block">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-black text-ink-subtle/40">#{i + 2}</span>
                  <CategoryBadge category={{ name: post.category_name, slug: post.category_slug, color: post.category_color, icon: post.category_icon }} />
                </div>
                <p className="text-sm font-semibold text-ink line-clamp-3 group-hover:text-primary-300 transition-colors leading-snug">
                  {post.title}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-ink-subtle">
                  <span className="font-semibold text-upvote">▲ {formatScore(post.score)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="size-3" />{post.comment_count}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Remaining list */}
      {remainder.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-muted">Also trending</h2>
          {remainder.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userId={profile?.id}
              isAuthenticated={Boolean(profile)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
