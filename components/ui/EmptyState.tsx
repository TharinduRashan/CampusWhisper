import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {Icon && (
        <div className="flex items-center justify-center size-16 rounded-2xl bg-card border border-card-border mb-5">
          <Icon className="size-7 text-ink-subtle" />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
