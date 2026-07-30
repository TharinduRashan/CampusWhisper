'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }, [theme, mounted])

  if (!mounted) {
    return <div className="size-9 rounded-xl bg-card animate-pulse" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'btn-ghost p-2.5 rounded-xl relative overflow-hidden',
        'hover:bg-card transition-all duration-200',
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative size-4">
        <Sun
          className={cn(
            'absolute inset-0 size-4 transition-all duration-300',
            theme === 'dark'
              ? 'opacity-0 rotate-90 scale-50'
              : 'opacity-100 rotate-0 scale-100 text-amber-400'
          )}
        />
        <Moon
          className={cn(
            'absolute inset-0 size-4 transition-all duration-300',
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100 text-primary-400'
              : 'opacity-0 -rotate-90 scale-50'
          )}
        />
      </div>
    </button>
  )
}
