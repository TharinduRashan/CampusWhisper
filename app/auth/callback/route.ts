import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types'

/**
 * Supabase Auth Callback Route Handler
 *
 * Supabase redirects here after the user clicks the magic link in their email.
 * This route:
 *   1. Exchanges the one-time `code` for a session
 *   2. Upserts the user's profile (email domain, admin flag)
 *   3. Redirects to the original destination (or home)
 *
 * URL: /auth/callback?code=xxx&next=/create
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Guard against open redirects — only allow relative paths
  const safNext = next.startsWith('/') ? next : '/'

  if (!code) {
    // No code param — redirect to login with error
    return NextResponse.redirect(
      new URL('/login?error=missing_code', origin)
    )
  }

  const response = NextResponse.redirect(new URL(safNext, origin))

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message)
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', origin)
    )
  }

  const user = data.user

  // ── Upsert profile ────────────────────────────────────────────
  // The DB trigger handle_new_user() does this too, but we also do it
  // here as a safety net (e.g. if the trigger missed due to timing).

  try {
    const emailDomain = user.email?.split('@')[1] ?? ''
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    const isAdmin = adminEmails.includes(user.email?.toLowerCase() ?? '')

    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email!,
        ...(isAdmin && { is_admin: true }),
      } as never,
      {
        onConflict: 'id',
        ignoreDuplicates: false,
      }
    )
  } catch (profileError) {
    // Non-fatal — profile might already exist from the trigger
    console.warn('[auth/callback] profile upsert warning:', profileError)
  }

  // ── Update last_seen_at ───────────────────────────────────────

  try {
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() } as never)
      .eq('id', user.id)
  } catch {
    // Non-fatal
  }

  return response
}
