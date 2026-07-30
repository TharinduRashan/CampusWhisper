import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

// ── Tailwind className merger ─────────────────────────────────

/**
 * Merges Tailwind CSS class names, resolving conflicts.
 * Usage: cn('px-4', condition && 'py-2', 'text-sm')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date / Time Formatting ────────────────────────────────────

/**
 * Returns a human-friendly relative time string.
 * e.g. "2 hours ago", "3 days ago"
 */
export function timeAgo(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return 'some time ago'
  }
}

/**
 * Returns a short, context-aware date label.
 * Today → "2:34 PM"
 * Yesterday → "Yesterday"
 * Otherwise → "Jul 28"
 * Older than a year → "Jul 28, 2024"
 */
export function formatDate(date: string | Date): string {
  try {
    const d = new Date(date)
    if (isToday(d)) return format(d, 'h:mm a')
    if (isYesterday(d)) return 'Yesterday'
    if (d.getFullYear() === new Date().getFullYear()) return format(d, 'MMM d')
    return format(d, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

/**
 * Full timestamp for tooltips.
 * e.g. "July 28, 2025, 2:34 PM"
 */
export function formatFullDate(date: string | Date): string {
  try {
    return format(new Date(date), 'MMMM d, yyyy, h:mm a')
  } catch {
    return '—'
  }
}

// ── Score Formatting ──────────────────────────────────────────

/**
 * Formats a vote score compactly.
 * e.g. 1234 → "1.2k", 999 → "999"
 */
export function formatScore(score: number): string {
  if (Math.abs(score) >= 1_000_000) {
    return `${(score / 1_000_000).toFixed(1)}m`
  }
  if (Math.abs(score) >= 1_000) {
    return `${(score / 1_000).toFixed(1)}k`
  }
  return score.toString()
}

/**
 * Returns the CSS color class for a vote score.
 */
export function scoreColor(score: number): string {
  if (score > 0) return 'text-upvote'
  if (score < 0) return 'text-downvote'
  return 'text-ink-subtle'
}

// ── Text Utilities ────────────────────────────────────────────

/**
 * Truncates text to maxLength with an ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Strips markdown / HTML for plain-text previews.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')          // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')     // italic
    .replace(/`[^`]+`/g, '')           // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\n+/g, ' ')              // newlines
    .trim()
}

// ── URL / Slug Utilities ──────────────────────────────────────

/**
 * Validates if a string is a valid UUID v4.
 */
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

/**
 * Converts a string to a URL-safe slug.
 * e.g. "Campus News!" → "campus-news"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ── University Email Validation ───────────────────────────────

/**
 * Validates that an email matches one of the allowed university domains.
 * If ALLOWED_EMAIL_DOMAINS is empty, all emails are accepted.
 */
export function isUniversityEmail(email: string): boolean {
  const allowedDomains = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? ''
  if (!allowedDomains) return true // No restriction — dev mode

  const domains = allowedDomains
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)

  if (domains.length === 0) return true

  const emailLower = email.toLowerCase()
  return domains.some((domain) => emailLower.endsWith(domain))
}

// ── Error Helpers ─────────────────────────────────────────────

/**
 * Extracts a user-friendly message from an unknown error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

/**
 * Safely parses JSON, returns null on failure.
 */
export function safeParseJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

// ── Pagination ────────────────────────────────────────────────

export const PAGE_SIZE = 20

/**
 * Calculates the offset for a given page number (1-indexed).
 */
export function pageToOffset(page: number, pageSize = PAGE_SIZE): number {
  return (page - 1) * pageSize
}

// ── Misc ──────────────────────────────────────────────────────

/**
 * Returns a promise that resolves after `ms` milliseconds.
 * Useful for testing loading states.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Debounces a function call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
