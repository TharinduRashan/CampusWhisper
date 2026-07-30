import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, getUserProfile } from '@/lib/supabase/server'

const VALID_REASONS = [
  'spam',
  'harassment',
  'false_information',
  'personal_information',
  'illegal_content',
  'other',
]

export async function POST(request: NextRequest) {
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: { message: 'Sign in to report content' } }, { status: 401 })
  }

  try {
    const { target_id, target_type, reason, details } = await request.json()

    if (!target_id || !target_type || !['post', 'comment'].includes(target_type)) {
      return NextResponse.json({ error: { message: 'Target ID and type (post/comment) are required' } }, { status: 400 })
    }

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: { message: 'Valid report reason is required' } }, { status: 400 })
    }

    const supabase = await createClient()

    // Create report
    const { data: report, error } = await (supabase
      .from('reports')
      .insert({
        reporter_id: profile.id,
        target_type,
        target_id,
        reason,
        details: details ? String(details).trim() : null,
      } as any)
      .select('*')
      .single() as any)

    if (error) {
      if (error.code === '23505') { // Unique constraint violation (already reported)
        return NextResponse.json({ error: { message: 'You have already reported this item.' } }, { status: 400 })
      }
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ report }, { status: 201 })
  } catch {
    return NextResponse.json({ error: { message: 'Invalid payload' } }, { status: 400 })
  }
}
