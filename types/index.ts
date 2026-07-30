// ============================================================
// CampusWhisper — TypeScript Types & Interfaces
// ============================================================

// ── Database Row Types ────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  email_domain: string
  is_admin: boolean
  is_suspended: boolean
  suspended_until: string | null
  suspended_reason: string | null
  post_count: number
  comment_count: number
  created_at: string
  last_seen_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  color: string
  icon: string
  post_count: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Post {
  id: string
  title: string
  body: string | null
  image_url: string | null
  category_id: number
  author_id: string
  upvotes: number
  downvotes: number
  score: number
  comment_count: number
  report_count: number
  is_hidden: boolean
  hidden_reason: string | null
  is_deleted: boolean
  trending_score: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  parent_comment_id: string | null
  author_id: string
  body: string
  depth: number
  upvotes: number
  downvotes: number
  score: number
  reply_count: number
  report_count: number
  is_hidden: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Vote {
  id: string
  user_id: string
  post_id: string | null
  comment_id: string | null
  vote_value: 1 | -1
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  target_type: 'post' | 'comment'
  target_id: string
  reason: ReportReason
  details: string | null
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  related_post_id: string | null
  related_comment_id: string | null
  is_read: boolean
  created_at: string
}

export interface AdminLog {
  id: string
  admin_id: string
  action: AdminAction
  target_type: string | null
  target_id: string | null
  notes: string | null
  created_at: string
}

// ── Enum Literals ─────────────────────────────────────────────

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'false_information'
  | 'personal_information'
  | 'illegal_content'
  | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned'

export type NotificationType =
  | 'post_reply'
  | 'comment_reply'
  | 'post_vote'
  | 'system'

export type AdminAction =
  | 'delete_post'
  | 'delete_comment'
  | 'suspend_user'
  | 'unsuspend_user'
  | 'hide_post'
  | 'unhide_post'
  | 'dismiss_report'
  | 'action_report'

export type SortMode =
  | 'hot'
  | 'new'
  | 'top_today'
  | 'top_week'
  | 'top_month'
  | 'top_all'

export type CommentSort = 'best' | 'new' | 'top'

export type VoteValue = 1 | -1 | 0

// ── Enriched / Joined Types ───────────────────────────────────

/** Post with category info joined — returned by get_feed_posts() RPC */
export interface PostWithCategory extends Post {
  category_name: string
  category_slug: string
  category_color: string
  category_icon: string
}

/** Post with category + current user's vote state */
export interface PostWithMeta extends PostWithCategory {
  user_vote: VoteValue       // 1 | -1 | 0
  is_bookmarked: boolean
  alias: string              // e.g. "Anonymous #A52F" — generated client-side
}

/** Comment with nested replies and alias */
export interface CommentWithMeta extends Comment {
  replies: CommentWithMeta[]
  user_vote: VoteValue
  alias: string
}

/** Notification enriched with related post/comment snippets */
export interface NotificationWithContext extends Notification {
  post_title?: string
  comment_preview?: string
}

/** Report enriched for admin dashboard */
export interface ReportWithTarget extends Report {
  post?: Pick<Post, 'id' | 'title' | 'is_deleted' | 'is_hidden'>
  comment?: Pick<Comment, 'id' | 'body' | 'is_deleted' | 'is_hidden'>
  reporter_email_domain?: string
}

// ── API Request / Response Types ──────────────────────────────

export interface FeedResponse {
  posts: PostWithMeta[]
  hasMore: boolean
  nextOffset: number
}

export interface CreatePostInput {
  title: string
  body?: string
  category_id: number
  image_url?: string
}

export interface CreateCommentInput {
  post_id: string
  parent_comment_id?: string
  body: string
}

export interface VoteInput {
  target_id: string
  target_type: 'post' | 'comment'
  value: VoteValue   // 0 = remove vote
}

export interface ReportInput {
  target_id: string
  target_type: 'post' | 'comment'
  reason: ReportReason
  details?: string
}

export interface SearchResult {
  posts: PostWithCategory[]
  total: number
}

// ── API Response wrapper ──────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    message: string
    code?: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Admin Dashboard ───────────────────────────────────────────

export interface AdminStats {
  total_users: number
  verified_users: number
  suspended_users: number
  total_posts: number
  total_comments: number
  total_votes: number
  pending_reports: number
  posts_today: number
  comments_today: number
  new_users_today: number
}

// ── Supabase Database type map (used with createClient<Database>) ──

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'email_domain' | 'post_count' | 'comment_count' | 'created_at' | 'last_seen_at'>
        Update: Partial<Omit<Profile, 'id' | 'email_domain'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'post_count' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'upvotes' | 'downvotes' | 'score' | 'comment_count' | 'report_count' | 'is_hidden' | 'hidden_reason' | 'is_deleted' | 'trending_score' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Post, 'id' | 'author_id' | 'created_at'>>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'upvotes' | 'downvotes' | 'score' | 'reply_count' | 'report_count' | 'is_hidden' | 'is_deleted' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Comment, 'id' | 'author_id' | 'post_id' | 'created_at'>>
      }
      votes: {
        Row: Vote
        Insert: Omit<Vote, 'id' | 'created_at' | 'updated_at'>
        Update: Pick<Vote, 'vote_value'>
      }
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'id' | 'created_at'>
        Update: never
      }
      reports: {
        Row: Report
        Insert: Omit<Report, 'id' | 'status' | 'reviewed_by' | 'reviewed_at' | 'created_at'>
        Update: Partial<Pick<Report, 'status' | 'reviewed_by' | 'reviewed_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'is_read' | 'created_at'>
        Update: Pick<Notification, 'is_read'>
      }
      admin_logs: {
        Row: AdminLog
        Insert: Omit<AdminLog, 'id' | 'created_at'>
        Update: never
      }
    }
    Functions: {
      get_feed_posts: {
        Args: {
          p_sort?: SortMode
          p_category_id?: number | null
          p_limit?: number
          p_offset?: number
        }
        Returns: PostWithCategory[]
      }
      get_trending_posts: {
        Args: { p_limit?: number }
        Returns: PostWithCategory[]
      }
      search_posts: {
        Args: {
          p_query: string
          p_category_id?: number | null
          p_limit?: number
          p_offset?: number
        }
        Returns: (PostWithCategory & { rank: number })[]
      }
      get_admin_stats: {
        Args: Record<string, never>
        Returns: AdminStats[]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_verified: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}
