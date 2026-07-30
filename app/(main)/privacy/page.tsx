import type { Metadata } from 'next'
import { Shield, Eye, Lock, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — CampusWhisper',
  description: 'Learn how CampusWhisper handles student email verification and anonymous content.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary-600/10 border border-primary-600/20 mb-1">
          <Lock className="size-6 text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-ink">Privacy Policy</h1>
        <p className="text-sm text-ink-muted leading-relaxed max-w-lg mx-auto">
          We take your anonymity seriously. Here is exactly how your data is handled.
        </p>
      </div>

      <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
        {/* Section 1 */}
        <section className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-ink font-semibold text-base">
            <Shield className="size-4 text-primary-400" />
            1. Email Verification Only
          </div>
          <p>
            Your university email address is collected strictly to verify that you are an active university student. Your email address is stored securely in encrypted databases and is <strong className="text-ink font-medium">NEVER</strong> shown publicly, shared with third parties, or linked to your posts in public feeds.
          </p>
        </section>

        {/* Section 2 */}
        <section className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-ink font-semibold text-base">
            <Eye className="size-4 text-primary-400" />
            2. Anonymous Thread Aliases
          </div>
          <p>
            Public posts, comments, and votes do not display usernames or profiles. Instead, a deterministic hash algorithm generates a thread-scoped alias (e.g. <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-card-border">Anonymous #K4MQ</code>) unique to that post. The same user receives different aliases across different posts to preserve anonymity.
          </p>
        </section>

        {/* Section 3 */}
        <section className="card p-6 space-y-3">
          <div className="flex items-center gap-2 text-ink font-semibold text-base">
            <FileText className="size-4 text-primary-400" />
            3. Data Retention & Moderation
          </div>
          <p>
            Content created on CampusWhisper is stored to maintain thread integrity. When content is flagged for serious policy violations, moderators may review flagged content. Accounts suspended for severe violations are prevented from creating new content while maintaining overall platform safety.
          </p>
        </section>
      </div>
    </div>
  )
}
