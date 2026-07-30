import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post, error } = await (supabase
    .from('posts')
    .select(`*, categories(id, name, slug, color, icon)`)
    .eq('id', id)
    .eq('is_deleted', false)
    .single() as any)

  if (error || !post) {
    return NextResponse.json({ error: { message: 'Post not found' } }, { status: 404 })
  }

  return NextResponse.json({ post })
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const profile = await getUserProfile()
  if (!profile) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const supabase = await createClient()

  // Fetch post to check authorship or admin
  const { data: post } = await (supabase
    .from('posts')
    .select('author_id')
    .eq('id', id)
    .single() as any)

  if (!post) {
    return NextResponse.json({ error: { message: 'Post not found' } }, { status: 404 })
  }

  if (post.author_id !== profile.id && !profile.is_admin) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 })
  }

  // Soft delete
  const { error } = await (supabase
    .from('posts')
    .update({ is_deleted: true } as never)
    .eq('id', id) as any)

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
