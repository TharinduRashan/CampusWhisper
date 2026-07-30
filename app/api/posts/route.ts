import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { LIMITS } from '@/lib/constants'
import type { SortMode } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sort = (searchParams.get('sort') as SortMode) || 'hot'
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null
  const offset = Number(searchParams.get('offset') ?? 0)
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50)

  const supabase = await createClient()
  const profile = await getUserProfile()

  const { data: postsRaw, error } = await (supabase.rpc as any)('get_feed_posts', {
    p_sort: sort,
    p_category_id: categoryId,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  const posts = (postsRaw ?? []) as any[]

  // Batch user votes/bookmarks
  let votesMap: Record<string, number> = {}
  let bookmarksSet = new Set<string>()

  if (profile && posts.length > 0) {
    const postIds = posts.map((p) => p.id)
    const [{ data: votes }, { data: bookmarks }] = await Promise.all([
      (supabase.from('votes').select('post_id, vote_value').eq('user_id', profile.id).in('post_id', postIds) as any),
      (supabase.from('bookmarks').select('post_id').eq('user_id', profile.id).in('post_id', postIds) as any),
    ])
    votesMap = Object.fromEntries((votes ?? []).map((v: any) => [v.post_id, v.vote_value]))
    bookmarksSet = new Set((bookmarks ?? []).map((b: any) => b.post_id))
  }

  const enrichedPosts = posts.map((p) => ({
    ...p,
    user_vote: votesMap[p.id] ?? 0,
    is_bookmarked: bookmarksSet.has(p.id),
  }))

  return NextResponse.json({
    posts: enrichedPosts,
    hasMore: posts.length >= limit,
    nextOffset: offset + posts.length,
  })
}

export async function POST(request: NextRequest) {
  const profile = await getUserProfile()
  if (!profile) {
    return NextResponse.json({ error: { message: 'Unauthorized. Please sign in.' } }, { status: 401 })
  }

  if (profile.is_suspended) {
    return NextResponse.json({ error: { message: 'Your account is suspended.' } }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, body: content, category_id, image_url } = body

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json({ error: { message: 'Title must be at least 3 characters long.' } }, { status: 400 })
    }

    if (title.length > LIMITS.POST_TITLE) {
      return NextResponse.json({ error: { message: `Title exceeds max length of ${LIMITS.POST_TITLE} chars.` } }, { status: 400 })
    }

    if (!category_id) {
      return NextResponse.json({ error: { message: 'Category is required.' } }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: post, error } = await (supabase
      .from('posts')
      .insert({
        title: title.trim(),
        body: content ? content.trim() : null,
        category_id: Number(category_id),
        author_id: profile.id,
        image_url: image_url || null,
      } as any)
      .select('*')
      .single() as any)

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: { message: 'Invalid JSON payload' } }, { status: 400 })
  }
}
