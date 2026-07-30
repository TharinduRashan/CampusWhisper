import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserProfile } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id: reportId } = await params
  const profile = await getUserProfile()

  if (!profile || !profile.is_admin) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 })
  }

  try {
    const { action } = await request.json()

    if (!['dismiss', 'hide'].includes(action)) {
      return NextResponse.json({ error: { message: 'Invalid action. Allowed: dismiss, hide' } }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Fetch report to get target
    const { data: report } = await (adminSupabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single() as any)

    if (!report) {
      return NextResponse.json({ error: { message: 'Report not found' } }, { status: 404 })
    }

    if (action === 'hide') {
      // Hide the post or comment
      if (report.target_type === 'post') {
        await (adminSupabase
          .from('posts')
          .update({ is_hidden: true, hidden_reason: 'Hidden by admin review' } as never)
          .eq('id', report.target_id) as any)
      } else if (report.target_type === 'comment') {
        await (adminSupabase
          .from('comments')
          .update({ is_hidden: true } as never)
          .eq('id', report.target_id) as any)
      }
    }

    // Update report status
    const status = action === 'dismiss' ? 'dismissed' : 'actioned'
    const { error } = await (adminSupabase
      .from('reports')
      .update({
        status,
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq('id', reportId) as any)

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }

    // Log admin action
    await (adminSupabase.from('admin_logs').insert({
      admin_id: profile.id,
      action: action === 'dismiss' ? 'dismiss_report' : 'action_report',
      target_type: report.target_type,
      target_id: report.target_id,
      notes: `Report ID: ${reportId}`,
    } as never) as any)

    return NextResponse.json({ success: true, status })
  } catch {
    return NextResponse.json({ error: { message: 'Invalid request payload' } }, { status: 400 })
  }
}
