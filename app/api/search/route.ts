import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50)
  const offset = Number(searchParams.get('offset') ?? 0)

  if (!query) {
    return NextResponse.json({ posts: [], hasMore: false })
  }

  const supabase = await createClient()

  const { data: results, error } = await (supabase.rpc as any)('search_posts', {
    p_query: query,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }

  const posts = (results ?? []) as any[]

  return NextResponse.json({
    posts,
    hasMore: posts.length >= limit,
    nextOffset: offset + posts.length,
  })
}
