'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Read saved theme from localStorage or document class
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'dark' | 'light' | null) : null
    const initial = saved || (document.documentElement.classList.contains('light') ? 'light' : 'dark')
    
    setTheme(initial)
    setMounted(true)

    // Ensure document element matches initial state
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(initial)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Ignore localStorage write failures (e.g. incognito)
    }

    // Direct DOM manipulation guarantees immediate class swapping
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(next)
  }

  if (!mounted) {
    return <div className="size-9 rounded-xl bg-card animate-pulse" />
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={cn(
        'btn-ghost p-2.5 rounded-xl relative overflow-hidden',
        'hover:bg-card transition-all duration-200 cursor-pointer',
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative size-4 pointer-events-none">
        <Sun
          className={cn(
            'absolute inset-0 size-4 transition-all duration-300',
            theme === 'dark'
              ? 'opacity-0 rotate-90 scale-50'
              : 'opacity-100 rotate-0 scale-100 text-amber-500'
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
