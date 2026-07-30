import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'
import { LIMITS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: { message: 'Sign in to comment' } }, { status: 401 })
  }

  if (profile.is_suspended) {
    return NextResponse.json({ error: { message: 'Your account is suspended' } }, { status: 403 })
  }

  try {
    const { post_id, parent_comment_id, body } = await request.json()

    if (!post_id || typeof post_id !== 'string') {
      return NextResponse.json({ error: { message: 'Post ID is required' } }, { status: 400 })
    }

    if (!body || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json({ error: { message: 'Comment body cannot be empty' } }, { status: 400 })
    }

    if (body.length > LIMITS.COMMENT_BODY) {
      return NextResponse.json({ error: { message: `Comment exceeds max length of ${LIMITS.COMMENT_BODY} chars` } }, { status: 400 })
    }

    const supabase = await createClient()

    // If nested reply, check depth
    let depth = 0
    if (parent_comment_id) {
      const { data: parent } = await (supabase
        .from('comments')
        .select('depth')
        .eq('id', parent_comment_id)
        .single() as any)

      if (parent) {
        depth = Math.min((parent.depth ?? 0) + 1, 5)
      }
    }

    const { data: comment, error } = await (supabase
      .from('comments')
      .insert({
        post_id,
        parent_comment_id: parent_comment_id || null,
        author_id: profile.id,
        body: body.trim(),
        depth,
      } as any)
      .select('*')
      .single() as any)

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: { message: 'Invalid JSON payload' } }, { status: 400 })
  }
}
