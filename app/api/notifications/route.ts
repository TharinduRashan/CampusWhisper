import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: notifications, error } = await (supabase
    .from('notifications')
    .select(`
      *,
      posts (title)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50) as any)

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ notifications: notifications ?? [] })
}

export async function PATCH(request: NextRequest) {
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const supabase = await createClient()

  const { error } = await (supabase
    .from('notifications')
    .update({ is_read: true } as never)
    .eq('user_id', profile.id)
    .eq('is_read', false) as any)

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
