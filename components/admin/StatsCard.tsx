import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  color?: 'violet' | 'amber' | 'emerald' | 'rose' | 'blue'
  trend?: string
}

const COLOR_STYLES = {
  violet:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  amber:   'bg-amber-500/10  text-amber-400  border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rose:    'bg-rose-500/10   text-rose-400   border-rose-500/20',
  blue:    'bg-blue-500/10   text-blue-400   border-blue-500/20',
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'violet',
  trend,
}: StatsCardProps) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">
          {title}
        </span>
        <div className={cn('flex items-center justify-center size-9 rounded-xl border', COLOR_STYLES[color])}>
          <Icon className="size-4.5" />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-ink">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-card-border/50 text-[11px] text-ink-muted">
          {trend}
        </div>
      )}
    </div>
  )
}
