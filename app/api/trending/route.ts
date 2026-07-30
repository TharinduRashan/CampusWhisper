import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50)

  const supabase = await createClient()

  const { data: posts, error } = await (supabase.rpc as any)('get_trending_posts', {
    p_limit: limit,
  })

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ posts: posts ?? [] })
}
