import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, FileText, Flag, MessageCircle, AlertTriangle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import StatsCard from '@/components/admin/StatsCard'
import ReportRow from '@/components/admin/ReportRow'
import type { ReportWithTarget } from '@/types'

export const metadata: Metadata = {
  title: 'Overview — Admin Dashboard',
}

export default async function AdminOverviewPage() {
  const adminSupabase = createAdminClient()

  // Fetch counts in parallel
  const [
    { count: totalUsers },
    { count: totalPosts },
    { count: totalComments },
    { count: pendingReports },
    { data: recentReportsRaw },
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    adminSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    adminSupabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    adminSupabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminSupabase
      .from('reports')
      .select(`
        *,
        posts (id, title, is_deleted, is_hidden),
        comments (id, body, is_deleted, is_hidden)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const recentReports = (recentReportsRaw ?? []) as any[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Dashboard Overview</h1>
        <p className="text-xs text-ink-subtle">Real-time platform metrics and pending moderation tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={totalUsers ?? 0}
          subtitle="Verified campus accounts"
          icon={Users}
          color="violet"
        />
        <StatsCard
          title="Total Posts"
          value={totalPosts ?? 0}
          subtitle="Active discussions"
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Total Comments"
          value={totalComments ?? 0}
          subtitle="Community replies"
          icon={MessageCircle}
          color="emerald"
        />
        <StatsCard
          title="Pending Reports"
          value={pendingReports ?? 0}
          subtitle="Requires moderation"
          icon={Flag}
          color={pendingReports && pendingReports > 0 ? 'rose' : 'amber'}
        />
      </div>

      {/* Pending Reports Quick Action Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400" />
            Recent Pending Reports
          </h2>
          <Link href="/admin/reports" className="text-xs font-semibold text-primary-400 hover:underline">
            View All Reports →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="card p-8 text-center text-ink-subtle text-sm">
            🎉 All clear! No pending reports at the moment.
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
