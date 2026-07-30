import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types'

// ── Route patterns ────────────────────────────────────────────

/** Routes that require the user to be authenticated */
const PROTECTED_ROUTES = [
  '/create',
  '/bookmarks',
  '/notifications',
  '/settings',
]

/** Routes that require the user to be an admin */
const ADMIN_ROUTES = ['/admin']

/** Routes only accessible when NOT authenticated (redirect to home if logged in) */
const AUTH_ONLY_ROUTES = ['/login', '/signup', '/verify']

// ── Helper: match a path against a list of prefixes ──────────

function matchesAny(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

// ── Middleware ────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // ── 1. Refresh Supabase session via cookies ─────────────────

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

  const supabase = createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get the current user (validates the JWT with Supabase)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── 2. Redirect auth-only routes if already logged in ───────

  if (user && matchesAny(pathname, AUTH_ONLY_ROUTES)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ── 3. Redirect protected routes if not logged in ───────────

  if (!user && matchesAny(pathname, PROTECTED_ROUTES)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 4. Check admin routes ────────────────────────────────────

  if (matchesAny(pathname, ADMIN_ROUTES)) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check admin status from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_suspended')
      .eq('id', user.id)
      .single() as { data: { is_admin: boolean; is_suspended: boolean } | null; error: unknown }

    if (!profile?.is_admin) {
      // Not an admin — 403
      return NextResponse.redirect(new URL('/?error=forbidden', request.url))
    }

    if (profile?.is_suspended) {
      return NextResponse.redirect(new URL('/?error=suspended', request.url))
    }
  }

  // ── 5. Block suspended users from protected routes ───────────

  if (user && matchesAny(pathname, PROTECTED_ROUTES)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_suspended, suspended_until')
      .eq('id', user.id)
      .single() as { data: { is_suspended: boolean; suspended_until: string | null } | null; error: unknown }

    if (profile?.is_suspended) {
      // Check if suspension has expired
      if (
        profile.suspended_until &&
        new Date(profile.suspended_until) < new Date()
      ) {
        // Suspension expired — auto-lift (admin can re-suspend manually)
        await supabase
          .from('profiles')
          .update({ is_suspended: false, suspended_until: null } as never)
          .eq('id', user.id)
      } else {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          new URL('/login?error=suspended', request.url)
        )
      }
    }
  }

  // ── 6. Rate limiting headers (Vercel handles this via Edge Config) ─
  // Placeholder: actual rate limiting would use Vercel's rate limiting
  // or an upstash/redis solution. For now, add security headers.

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico
     * - public folder files (*.svg, *.png, *.jpg, *.ico, *.webp)
     * - API routes (handled with their own auth checks)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
