import type { Metadata } from 'next'
import { Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import UserRow from '@/components/admin/UserRow'
import type { Profile } from '@/types'

export const metadata: Metadata = {
  title: 'User Management — Admin Dashboard',
}

export default async function AdminUsersPage() {
  const adminSupabase = createAdminClient()

  const { data: usersRaw } = await adminSupabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const users = (usersRaw ?? []) as Profile[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">User Management</h1>
        <p className="text-xs text-ink-subtle">Review registered student accounts and manage suspensions</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}
