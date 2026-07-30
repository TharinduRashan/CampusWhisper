import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

/**
 * Supabase admin client — uses the SERVICE ROLE key.
 *
 * ⚠️  SECURITY: This bypasses ALL Row Level Security policies.
 * Use ONLY in:
 *   - Server-side admin API routes (/api/admin/*)
 *   - Background jobs / cron functions
 *   - NEVER in Client Components or public API routes
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
