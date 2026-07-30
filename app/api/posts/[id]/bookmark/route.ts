import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id: postId } = await params
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: { message: 'Sign in to save bookmarks' } }, { status: 401 })
  }

  const supabase = await createClient()

  // Check existing bookmark
  const { data: existing } = await (supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', profile.id)
    .eq('post_id', postId)
    .single() as any)

  if (existing) {
    // Remove bookmark
    await (supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id) as any)

    return NextResponse.json({ bookmarked: false })
  } else {
    // Add bookmark
    const { error } = await (supabase
      .from('bookmarks')
      .insert({
        user_id: profile.id,
        post_id: postId,
      } as any) as any)

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ bookmarked: true })
  }
}
