import type { Metadata } from 'next'
import { ShieldCheck, Heart, EyeOff, AlertTriangle, MessageSquare, Flag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Community Guidelines — CampusWhisper',
  description: 'Rules and guidelines for maintaining a safe, constructive anonymous campus space.',
}

const GUIDELINES = [
  {
    icon: EyeOff,
    title: '1. Respect Anonymous Privacy (No Doxxing)',
    description:
      'Never publish private personal information (full names, personal phone numbers, addresses, private social media handles, or sensitive identity details) of any student, faculty, or staff member.',
  },
  {
    icon: Heart,
    title: '2. Zero Tolerance for Harassment & Bullying',
    description:
      'Targeted harassment, hate speech, threats of violence, discrimination, or malicious attacks against specific individuals or groups will result in immediate content removal and account suspension.',
  },
  {
    icon: AlertTriangle,
    title: '3. No False Information or Harmful Rumors',
    description:
      'Do not knowingly spread fabricated news, harmful defamation, or false safety emergencies that could cause panic or ruin reputations across campus.',
  },
  {
    icon: MessageSquare,
    title: '4. Keep Content Relevant & Constructive',
    description:
      'Share honest experiences, ask genuine questions, post memes, discuss student life, or vent safely. Avoid commercial spam, unauthorized advertising, or automated bot posts.',
  },
  {
    icon: Flag,
    title: '5. Use the Reporting System Responsibility',
    description:
      'If you see content that breaks these guidelines, hit the Report flag. Posts receiving multiple reports are automatically hidden pending human moderation review.',
  },
]

export default function GuidelinesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary-600/10 border border-primary-600/20 mb-1">
          <ShieldCheck className="size-6 text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-ink">Community Guidelines</h1>
        <p className="text-sm text-ink-muted leading-relaxed max-w-lg mx-auto">
          CampusWhisper is built to empower honest campus voices while protecting student privacy and well-being.
        </p>
      </div>

      {/* Guidelines list */}
      <div className="space-y-4">
        {GUIDELINES.map(({ icon: Icon, title, description }) => (
          <article key={title} className="card p-5 space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center size-8 rounded-xl bg-card-hover shrink-0">
                <Icon className="size-4 text-primary-400" />
              </span>
              <h2 className="text-base font-semibold text-ink">{title}</h2>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed pl-11">
              {description}
            </p>
          </article>
        ))}
      </div>

      {/* Footer note */}
      <div className="card p-5 text-center bg-card-hover border-card-border">
        <p className="text-xs text-ink-subtle leading-relaxed">
          Violations of these guidelines are subject to automated post hiding, administrative warning, temporary suspension, or permanent account revocation.
        </p>
      </div>
    </div>
  )
}
