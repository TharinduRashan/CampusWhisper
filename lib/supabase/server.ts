import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database, Profile } from '@/types'

/**
 * Supabase server client — use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes auth cookies via Next.js cookies().
 */
export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

  return createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — ignore.
            // Middleware handles cookie refresh.
          }
        },
      },
    }
  )
}

/**
 * Get the current authenticated user from the server.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current user's profile from the profiles table.
 * Returns null if not authenticated or profile not found.
 */
export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await (supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as any)

  return (profile as Profile) ?? null
}
