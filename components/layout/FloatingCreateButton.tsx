'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingCreateButtonProps {
  isAuthenticated: boolean
  className?: string
}

export default function FloatingCreateButton({
  isAuthenticated,
  className,
}: FloatingCreateButtonProps) {
  const href = isAuthenticated ? '/create' : '/login?next=/create'

  return (
    <Link
      href={href}
      aria-label="Create new post"
      className={cn(
        'fixed bottom-20 right-4 z-30 md:hidden',
        'flex items-center justify-center',
        'size-14 rounded-2xl',
        'bg-primary-600 text-white',
        'shadow-glow hover:shadow-glow',
        'hover:bg-primary-500 active:scale-95',
        'transition-all duration-200',
        className
      )}
    >
      <Plus className="size-6" strokeWidth={2.5} />
    </Link>
  )
}
