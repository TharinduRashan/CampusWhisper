import type { SortMode, CommentSort, ReportReason } from '@/types'

// ── App Meta ──────────────────────────────────────────────────

export const APP_NAME = 'CampusWhisper'
export const APP_DESCRIPTION =
  'Anonymous campus discussions for verified university students.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ── Pagination ────────────────────────────────────────────────

export const PAGE_SIZE = 20
export const MAX_DEPTH  = 5   // Maximum comment nesting depth
export const REPORT_THRESHOLD = 5  // Auto-hide after this many reports

// ── Feed Sort Options ─────────────────────────────────────────

export interface SortOption {
  value: SortMode
  label: string
  shortLabel: string
  description: string
}

export const SORT_OPTIONS: SortOption[] = [
  {
    value: 'hot',
    label: 'Hot',
    shortLabel: '🔥 Hot',
    description: 'Trending posts ranked by score and recency',
  },
  {
    value: 'new',
    label: 'New',
    shortLabel: '✨ New',
    description: 'Most recently posted',
  },
  {
    value: 'top_today',
    label: 'Top Today',
    shortLabel: '📈 Today',
    description: 'Highest voted in the last 24 hours',
  },
  {
    value: 'top_week',
    label: 'Top This Week',
    shortLabel: '📆 Week',
    description: 'Highest voted in the last 7 days',
  },
  {
    value: 'top_month',
    label: 'Top This Month',
    shortLabel: '📅 Month',
    description: 'Highest voted in the last 30 days',
  },
  {
    value: 'top_all',
    label: 'Top All Time',
    shortLabel: '🏆 All Time',
    description: 'Highest voted posts ever',
  },
]

// ── Comment Sort Options ──────────────────────────────────────

export interface CommentSortOption {
  value: CommentSort
  label: string
}

export const COMMENT_SORT_OPTIONS: CommentSortOption[] = [
  { value: 'best', label: 'Best' },
  { value: 'new',  label: 'New'  },
  { value: 'top',  label: 'Top'  },
]

// ── Categories (mirrors DB seed — used for client-side rendering) ─

export interface CategoryMeta {
  name: string
  slug: string
  color: string
  icon: string
  description: string
}

export const CATEGORIES: CategoryMeta[] = [
  {
    name: 'Gossip',
    slug: 'gossip',
    color: '#ec4899',
    icon: 'Flame',
    description: 'Campus gossip, tea, and drama worth talking about.',
  },
  {
    name: 'Confessions',
    slug: 'confessions',
    color: '#f59e0b',
    icon: 'Heart',
    description: 'Anonymous confessions — your secrets are safe here.',
  },
  {
    name: 'Memes',
    slug: 'memes',
    color: '#10b981',
    icon: 'Smile',
    description: 'Campus memes, jokes, and funny moments.',
  },
  {
    name: 'Questions',
    slug: 'questions',
    color: '#3b82f6',
    icon: 'HelpCircle',
    description: 'Ask anything about campus life, courses, or student life.',
  },
  {
    name: 'Relationships',
    slug: 'relationships',
    color: '#f43f5e',
    icon: 'HeartHandshake',
    description: 'Dating, crushes, heartbreaks, and everything in between.',
  },
  {
    name: 'Campus News',
    slug: 'campus-news',
    color: '#8b5cf6',
    icon: 'Newspaper',
    description: 'Latest updates, announcements, and university news.',
  },
  {
    name: 'Clubs',
    slug: 'clubs',
    color: '#06b6d4',
    icon: 'Users',
    description: 'Student clubs, societies, and organizations.',
  },
  {
    name: 'Events',
    slug: 'events',
    color: '#f97316',
    icon: 'Calendar',
    description: 'Upcoming events, parties, and things to do on campus.',
  },
  {
    name: 'Lost & Found',
    slug: 'lost-and-found',
    color: '#6366f1',
    icon: 'Search',
    description: 'Lost something? Found something? Post it here.',
  },
  {
    name: 'Marketplace',
    slug: 'marketplace',
    color: '#84cc16',
    icon: 'ShoppingBag',
    description: 'Buy, sell, and trade with fellow students.',
  },
  {
    name: 'Rants',
    slug: 'rants',
    color: '#ef4444',
    icon: 'Zap',
    description: 'Let it out — vent about anything campus-related.',
  },
]

// ── Report Reasons ────────────────────────────────────────────

export interface ReportReasonOption {
  value: ReportReason
  label: string
  description: string
}

export const REPORT_REASONS: ReportReasonOption[] = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Repetitive, promotional, or irrelevant content.',
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Bullying, threats, or targeted abuse.',
  },
  {
    value: 'false_information',
    label: 'False Information',
    description: 'Deliberately misleading or fabricated content.',
  },
  {
    value: 'personal_information',
    label: 'Personal Information',
    description: 'Sharing someone\'s private info without consent (doxxing).',
  },
  {
    value: 'illegal_content',
    label: 'Illegal Content',
    description: 'Content that violates laws or regulations.',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else that violates our community guidelines.',
  },
]

// ── Notification Types ────────────────────────────────────────

export const NOTIFICATION_LABELS: Record<string, string> = {
  post_reply:    'Someone replied to your post',
  comment_reply: 'Someone replied to your comment',
  post_vote:     'Your post is trending',
  system:        'System notification',
}

// ── University Email Domains (client-accessible subset) ───────

export const COMMON_UNI_DOMAINS = [
  '.edu',
  '.ac.uk',
  '.ac.lk',
  '.ac.za',
  '.edu.au',
  '.ac.nz',
  '.edu.sg',
  '.ac.in',
]

// ── Max lengths (mirror DB constraints) ───────────────────────

export const LIMITS = {
  POST_TITLE:   300,
  POST_BODY:    10_000,
  COMMENT_BODY: 5_000,
  REPORT_NOTES: 1_000,
}

// ── Image upload ──────────────────────────────────────────────

export const UPLOAD_CONFIG = {
  maxSizeMB: 5,
  maxSizeBytes: 5 * 1024 * 1024,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  bucket: 'post-images',
}

// ── Admin ─────────────────────────────────────────────────────

export const ADMIN_NAV_ITEMS = [
  { href: '/admin',          label: 'Overview',   icon: 'LayoutDashboard' },
  { href: '/admin/reports',  label: 'Reports',    icon: 'Flag'            },
  { href: '/admin/posts',    label: 'Posts',      icon: 'FileText'        },
  { href: '/admin/users',    label: 'Users',      icon: 'Users'           },
]

// ── Nav items ─────────────────────────────────────────────────

export const MAIN_NAV_ITEMS = [
  { href: '/',              label: 'Home',        icon: 'Home'            },
  { href: '/trending',      label: 'Trending',    icon: 'TrendingUp'      },
  { href: '/categories',    label: 'Categories',  icon: 'Grid3X3'         },
  { href: '/search',        label: 'Search',      icon: 'Search'          },
  { href: '/bookmarks',     label: 'Bookmarks',   icon: 'Bookmark'        },
  { href: '/notifications', label: 'Notifications', icon: 'Bell'          },
]
