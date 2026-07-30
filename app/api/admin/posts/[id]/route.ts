import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserProfile } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id: postId } = await params
  const profile = await getUserProfile()

  if (!profile || !profile.is_admin) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 })
  }

  try {
    const { is_hidden } = await request.json()

    if (typeof is_hidden !== 'boolean') {
      return NextResponse.json({ error: { message: 'is_hidden boolean is required' } }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    const { error } = await (adminSupabase
      .from('posts')
      .update({
        is_hidden,
        hidden_reason: is_hidden ? 'Hidden by administrator' : null,
      } as never)
      .eq('id', postId) as any)

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }

    // Log admin action
    await (adminSupabase.from('admin_logs').insert({
      admin_id: profile.id,
      action: is_hidden ? 'hide_post' : 'unhide_post',
      target_type: 'post',
      target_id: postId,
      notes: is_hidden ? 'Post hidden by admin' : 'Post unhidden by admin',
    } as never) as any)

    return NextResponse.json({ success: true, is_hidden })
  } catch {
    return NextResponse.json({ error: { message: 'Invalid payload' } }, { status: 400 })
  }
}
