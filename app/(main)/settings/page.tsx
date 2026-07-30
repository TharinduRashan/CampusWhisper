import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Settings as SettingsIcon, Shield, Mail, Calendar, Moon, Trash2, LogOut } from 'lucide-react'
import { getUserProfile } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { signOut } from '@/app/(auth)/actions'

export const metadata: Metadata = {
  title: 'Settings — CampusWhisper',
  description: 'Manage your account settings and privacy preferences.',
}

export default async function SettingsPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login?next=/settings')
  }

  // Mask email for privacy display e.g. j***n@university.edu
  const [local, domain] = profile.email.split('@')
  const maskedEmail = `${local.charAt(0)}***${local.slice(-1)}@${domain}`

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-2xl bg-primary-600/10">
          <SettingsIcon className="size-5 text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Account Settings</h1>
          <p className="text-xs text-ink-subtle">Privacy & preference management</p>
        </div>
      </div>

      {/* Account Info */}
      <section className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
          Verification & Security
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-card-border/50">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-ink-subtle" />
              <div>
                <p className="text-xs text-ink-subtle">Verified Email</p>
                <p className="text-sm font-medium text-ink">{maskedEmail}</p>
              </div>
            </div>
            <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2.5 py-0.5">
              Verified
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-card-border/50">
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-ink-subtle" />
              <div>
                <p className="text-xs text-ink-subtle">Member Since</p>
                <p className="text-sm font-medium text-ink">{formatDate(profile.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Shield className="size-4 text-ink-subtle" />
              <div>
                <p className="text-xs text-ink-subtle">Account Type</p>
                <p className="text-sm font-medium text-ink">
                  {profile.is_admin ? 'Administrator 🛡️' : 'Verified Student 🎓'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
          Preferences
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="size-4 text-ink-subtle" />
            <div>
              <p className="text-sm font-medium text-ink">Theme Mode</p>
              <p className="text-xs text-ink-subtle">Switch between Dark and Light mode</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Privacy Notice Card */}
      <div className="p-4 rounded-xl bg-primary-600/5 border border-primary-600/10 space-y-2">
        <p className="text-xs font-semibold text-primary-400">🔒 Anonymity Guarantee</p>
        <p className="text-xs text-ink-muted leading-relaxed">
          CampusWhisper does not store public usernames or profiles. Your posts, comments, and votes are linked to your internal user ID only for feed generation and moderation, and are rendered publicly with post-specific random aliases (e.g. #K4MQ).
        </p>
      </div>

      {/* Account Actions */}
      <section className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
          Session
        </h2>

        <form action={signOut}>
          <button
            type="submit"
            className="btn-secondary w-full justify-center"
          >
            <LogOut className="size-4" />
            Sign Out of All Devices
          </button>
        </form>
      </section>
    </div>
  )
}
