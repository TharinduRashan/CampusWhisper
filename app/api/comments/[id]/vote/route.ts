import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id: commentId } = await params
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: { message: 'Sign in to vote' } }, { status: 401 })
  }

  if (profile.is_suspended) {
    return NextResponse.json({ error: { message: 'Your account is suspended' } }, { status: 403 })
  }

  try {
    const { value } = await request.json()

    if (![1, -1, 0].includes(value)) {
      return NextResponse.json({ error: { message: 'Invalid vote value' } }, { status: 400 })
    }

    const supabase = await createClient()

    if (value === 0) {
      // Remove vote
      await (supabase
        .from('votes')
        .delete()
        .eq('user_id', profile.id)
        .eq('comment_id', commentId) as any)
    } else {
      // Upsert vote
      const { error } = await (supabase
        .from('votes')
        .upsert(
          {
            user_id: profile.id,
            comment_id: commentId,
            vote_value: value,
          } as any,
          { onConflict: 'user_id,comment_id' }
        ) as any)

      if (error) {
        return NextResponse.json({ error: { message: error.message } }, { status: 500 })
      }
    }

    // Fetch updated score
    const { data: comment } = await (supabase
      .from('comments')
      .select('score, upvotes, downvotes')
      .eq('id', commentId)
      .single() as any)

    return NextResponse.json({ success: true, vote: value, comment })
  } catch {
    return NextResponse.json({ error: { message: 'Invalid request payload' } }, { status: 400 })
  }
}
