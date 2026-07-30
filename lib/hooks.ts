'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Debounce hook — returns a debounced version of a value.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

/**
 * Boolean toggle hook.
 */
export function useToggle(initial = false) {
  const [state, setState] = useState(initial)
  const toggle = useCallback(() => setState((s) => !s), [])
  const setTrue = useCallback(() => setState(true), [])
  const setFalse = useCallback(() => setState(false), [])
  return { state, toggle, setTrue, setFalse }
}

/**
 * useOnClickOutside — calls handler when a click occurs outside the ref.
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

/**
 * useLocalStorage — synced with localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (e) {
          console.error('useLocalStorage write error:', e)
        }
        return valueToStore
      })
    },
    [key]
  )

  return [storedValue, setValue] as const
}

/**
 * usePrevious — returns the previous value of a variable.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
