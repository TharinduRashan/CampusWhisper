import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, EyeOff, Trash2, ExternalLink } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { timeAgo, formatScore } from '@/lib/utils'
import CategoryBadge from '@/components/ui/CategoryBadge'
import AdminPostRow from './AdminPostRow'

export const metadata: Metadata = {
  title: 'Posts Moderation — Admin Dashboard',
}

export default async function AdminPostsPage() {
  const adminSupabase = createAdminClient()

  const { data: postsRaw } = await adminSupabase
    .from('posts')
    .select(`
      *,
      categories (name, slug, color, icon)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const posts = (postsRaw ?? []) as any[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Post Moderation</h1>
        <p className="text-xs text-ink-subtle">Manage published campus posts, hide offensive content, or soft delete</p>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <AdminPostRow key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
