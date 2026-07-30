import type { Metadata } from 'next'
import { Flag } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import ReportRow from '@/components/admin/ReportRow'
import EmptyState from '@/components/ui/EmptyState'

export const metadata: Metadata = {
  title: 'Reports — Admin Dashboard',
}

interface ReportsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminReportsPage({ searchParams }: ReportsPageProps) {
  const { status = 'pending' } = await searchParams
  const adminSupabase = createAdminClient()

  let query = adminSupabase
    .from('reports')
    .select(`
      *,
      posts (id, title, is_deleted, is_hidden),
      comments (id, body, is_deleted, is_hidden)
    `)
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: reportsRaw } = await query
  const reports = (reportsRaw ?? []) as any[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Content Moderation Queue</h1>
          <p className="text-xs text-ink-subtle">Review user reports and take moderation actions</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-card-border pb-3">
        {['pending', 'dismissed', 'actioned', 'all'].map((tab) => (
          <a
            key={tab}
            href={`/admin/reports?status=${tab}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              status === tab
                ? 'bg-primary-600 text-white shadow-glow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-card'
            }`}
          >
            {tab}
          </a>
        ))}
      </div>

      {/* Reports list */}
      {reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={`No ${status} reports`}
          description="Reports submitted by students will appear here."
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}
