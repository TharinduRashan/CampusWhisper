import type { Category } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: Pick<Category, 'name' | 'slug' | 'color' | 'icon'>
  size?: 'sm' | 'md'
  className?: string
  onClick?: () => void
}

export default function CategoryBadge({
  category,
  size = 'sm',
  className,
  onClick,
}: CategoryBadgeProps) {
  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'badge font-semibold transition-all duration-150',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        onClick && 'cursor-pointer hover:opacity-80 active:scale-95',
        className
      )}
      style={{
        backgroundColor: `${category.color}18`,
        color: category.color,
        borderColor: `${category.color}30`,
        border: '1px solid',
      }}
    >
      {category.name}
    </Tag>
  )
}
