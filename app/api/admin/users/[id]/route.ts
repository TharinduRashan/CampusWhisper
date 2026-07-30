import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserProfile } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id: targetUserId } = await params
  const profile = await getUserProfile()

  if (!profile || !profile.is_admin) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 })
  }

  try {
    const { is_suspended, suspended_reason } = await request.json()

    if (typeof is_suspended !== 'boolean') {
      return NextResponse.json({ error: { message: 'is_suspended boolean is required' } }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    const { error } = await (adminSupabase
      .from('profiles')
      .update({
        is_suspended,
        suspended_reason: is_suspended ? (suspended_reason || 'Violated community guidelines') : null,
      } as never)
      .eq('id', targetUserId) as any)

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }

    // Log admin action
    await (adminSupabase.from('admin_logs').insert({
      admin_id: profile.id,
      action: is_suspended ? 'suspend_user' : 'unsuspend_user',
      target_type: 'user',
      target_id: targetUserId,
      notes: is_suspended ? `Reason: ${suspended_reason}` : 'Suspension lifted',
    } as never) as any)

    return NextResponse.json({ success: true, is_suspended })
  } catch {
    return NextResponse.json({ error: { message: 'Invalid payload' } }, { status: 400 })
  }
}
