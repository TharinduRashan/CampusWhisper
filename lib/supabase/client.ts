import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types'

/**
 * Supabase browser client — safe to use in Client Components.
 * Creates a singleton per browser tab.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'
  return createBrowserClient<Database>(url, key)
}
