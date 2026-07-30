import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: comment } = await (supabase
    .from('comments')
    .select('author_id')
    .eq('id', id)
    .single() as any)

  if (!comment) {
    return NextResponse.json({ error: { message: 'Comment not found' } }, { status: 404 })
  }

  if (comment.author_id !== profile.id && !profile.is_admin) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 })
  }

  // Soft delete comment
  const { error } = await (supabase
    .from('comments')
    .update({ is_deleted: true, body: '[deleted]' } as never)
    .eq('id', id) as any)

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
