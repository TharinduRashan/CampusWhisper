import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/server'
import VoteButtons from '@/components/votes/VoteButtons'
import CommentThread from '@/components/comments/CommentThread'
import PostDetailHeader from '@/components/posts/PostDetailHeader'
import { getAnonLabel } from '@/lib/alias'
import type { CommentWithMeta, CommentSort, PostWithMeta } from '@/types'

interface PostPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ commentSort?: string }>
}

// Build nested comment tree from flat array
function buildCommentTree(
  comments: any[],
  postId: string,
  userId?: string,
  votesMap: Record<string, number> = {}
): CommentWithMeta[] {
  const map = new Map<string, CommentWithMeta>()

  comments.forEach((c) => {
    map.set(c.id, {
      ...c,
      replies: [],
      user_vote: (votesMap[c.id] ?? 0) as 0 | 1 | -1,
      alias: getAnonLabel(postId, c.author_id),
    })
  })

  const roots: CommentWithMeta[] = []
  map.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parent = map.get(comment.parent_comment_id)
      if (parent) parent.replies.push(comment)
    } else {
      roots.push(comment)
    }
  })
  return roots
}

function sortComments(comments: CommentWithMeta[], sort: CommentSort): CommentWithMeta[] {
  const sorted = [...comments]
  switch (sort) {
    case 'new':  sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break
    case 'top':  sorted.sort((a, b) => b.score - a.score); break
    case 'best': sorted.sort((a, b) => b.score - a.score); break
  }
  return sorted.map((c) => ({ ...c, replies: sortComments(c.replies, sort) }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await (supabase
    .from('posts').select('title, body').eq('id', id).single() as any)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: `${post.title} — CampusWhisper`,
    description: post.body?.slice(0, 160) ?? 'Anonymous campus discussion.',
  }
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { id } = await params
  const { commentSort = 'best' } = await searchParams
  const sort = commentSort as CommentSort

  const supabase = await createClient()
  const profile = await getUserProfile()

  // Fetch post with category
  const { data: postRaw } = await (supabase
    .from('posts')
    .select(`*, categories(id, name, slug, color, icon)`)
    .eq('id', id)
    .eq('is_deleted', false)
    .single() as any)

  if (!postRaw) notFound()

  const cat = postRaw.categories as any

  // Fetch comments (flat, ordered by created_at for tree building)
  const { data: commentsRaw } = await (supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true }) as any)

  const allComments = commentsRaw ?? []

  // Batch user data
  let userVote: 0 | 1 | -1 = 0
  let isBookmarked = false
  let commentVotesMap: Record<string, number> = {}

  if (profile) {
    const commentIds = allComments.map((c: any) => c.id)
    const [
      { data: postVote },
      { data: bookmark },
      { data: commentVotes },
    ] = await Promise.all([
      (supabase.from('votes').select('vote_value').eq('user_id', profile.id).eq('post_id', id).single() as any),
      (supabase.from('bookmarks').select('id').eq('user_id', profile.id).eq('post_id', id).single() as any),
      commentIds.length > 0
        ? (supabase.from('votes').select('comment_id, vote_value').eq('user_id', profile.id).in('comment_id', commentIds) as any)
        : Promise.resolve({ data: [] }),
    ])
    userVote = (postVote?.vote_value ?? 0) as 0 | 1 | -1
    isBookmarked = Boolean(bookmark)
    commentVotesMap = Object.fromEntries(
      (commentVotes ?? []).map((v: any) => [v.comment_id, v.vote_value])
    )
  }

  const post: PostWithMeta = {
    ...postRaw,
    category_name: cat?.name ?? '',
    category_slug: cat?.slug ?? '',
    category_color: cat?.color ?? '#7c3aed',
    category_icon: cat?.icon ?? 'MessageCircle',
    user_vote: userVote,
    is_bookmarked: isBookmarked,
    alias: getAnonLabel(id, postRaw.author_id),
  }

  const commentTree = sortComments(
    buildCommentTree(allComments, id, profile?.id, commentVotesMap),
    sort
  )

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors group"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </Link>

      {/* Post card */}
      <article className="card p-6 space-y-4">
        {/* Category + header actions */}
        <PostDetailHeader
          post={{
            id: post.id,
            title: post.title,
            author_id: post.author_id,
            created_at: post.created_at,
            category_name: post.category_name,
            category_slug: post.category_slug,
            category_color: post.category_color,
            category_icon: post.category_icon,
          }}
          userId={profile?.id}
        />

        {/* Title */}
        <h1 className="text-xl font-bold text-ink leading-tight">{post.title}</h1>

        {/* Body */}
        {post.body && (
          <div className="post-body text-sm">
            {post.body.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

        {/* Image */}
        {post.image_url && (
          <div className="relative rounded-xl overflow-hidden border border-card-border">
            <Image
              src={post.image_url}
              alt={post.title}
              width={800}
              height={450}
              className="w-full object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* Vote row */}
        <div className="flex items-center gap-3 pt-2 border-t border-card-border/50">
          <VoteButtons
            targetId={post.id}
            targetType="post"
            initialScore={post.score}
            initialVote={userVote}
            isAuthenticated={Boolean(profile)}
          />
          <span className="text-xs text-ink-subtle">
            {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      </article>

      {/* Comments */}
      <CommentThread
        comments={commentTree}
        postId={id}
        postAuthorId={postRaw.author_id}
        commentCount={post.comment_count}
        userId={profile?.id}
        isAuthenticated={Boolean(profile)}
        currentSort={sort}
      />
    </div>
  )
}
