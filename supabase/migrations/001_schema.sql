-- ============================================================
-- CampusWhisper — Migration 001: Schema
-- Run this first in your Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- For full-text / trigram search
CREATE EXTENSION IF NOT EXISTS "unaccent";     -- For accent-insensitive search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE vote_value      AS ENUM ('1', '-1');
CREATE TYPE report_reason   AS ENUM (
  'spam',
  'harassment',
  'false_information',
  'personal_information',
  'illegal_content',
  'other'
);
CREATE TYPE report_status   AS ENUM ('pending', 'reviewed', 'dismissed', 'actioned');
CREATE TYPE report_target   AS ENUM ('post', 'comment');
CREATE TYPE notification_type AS ENUM (
  'post_reply',
  'comment_reply',
  'post_vote',
  'system'
);
CREATE TYPE admin_action    AS ENUM (
  'delete_post',
  'delete_comment',
  'suspend_user',
  'unsuspend_user',
  'hide_post',
  'unhide_post',
  'dismiss_report',
  'action_report'
);

-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users — one row per verified user
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  email_domain    TEXT GENERATED ALWAYS AS (
                    split_part(email, '@', 2)
                  ) STORED,
  is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended    BOOLEAN NOT NULL DEFAULT FALSE,
  suspended_until TIMESTAMPTZ,
  suspended_reason TEXT,
  post_count      INTEGER NOT NULL DEFAULT 0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS
  'Public user profiles — email is private, no usernames.';

-- ============================================================
-- TABLE: categories
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#7c3aed',   -- Tailwind hex
  icon        TEXT NOT NULL DEFAULT 'MessageCircle', -- Lucide icon name
  post_count  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS
  'Post categories (Gossip, Confessions, Memes, etc.)';

-- ============================================================
-- TABLE: posts
-- ============================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 300),
  body          TEXT CHECK (char_length(body) <= 10000),
  image_url     TEXT,
  category_id   INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Aggregated counters (updated by triggers)
  upvotes       INTEGER NOT NULL DEFAULT 0,
  downvotes     INTEGER NOT NULL DEFAULT 0,
  score         INTEGER NOT NULL DEFAULT 0,   -- upvotes - downvotes
  comment_count INTEGER NOT NULL DEFAULT 0,
  report_count  INTEGER NOT NULL DEFAULT 0,

  -- Moderation
  is_hidden     BOOLEAN NOT NULL DEFAULT FALSE,
  hidden_reason TEXT,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,  -- soft delete

  -- Full-text search vector (updated by trigger)
  search_vector TSVECTOR,

  -- Trending score (updated periodically)
  trending_score FLOAT NOT NULL DEFAULT 0,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.posts IS
  'Anonymous posts — author_id is never exposed publicly.';

-- Indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_category    ON public.posts(category_id) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_posts_author      ON public.posts(author_id)   WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_posts_created_at  ON public.posts(created_at DESC) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_posts_score       ON public.posts(score DESC)  WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_posts_trending    ON public.posts(trending_score DESC) WHERE NOT is_deleted AND NOT is_hidden;
CREATE INDEX IF NOT EXISTS idx_posts_search      ON public.posts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_posts_active      ON public.posts(created_at DESC)
  WHERE NOT is_deleted AND NOT is_hidden;

-- ============================================================
-- TABLE: comments
-- ============================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id           UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body              TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  depth             INTEGER NOT NULL DEFAULT 0, -- 0 = top-level, max 5

  -- Aggregated counters
  upvotes           INTEGER NOT NULL DEFAULT 0,
  downvotes         INTEGER NOT NULL DEFAULT 0,
  score             INTEGER NOT NULL DEFAULT 0,
  reply_count       INTEGER NOT NULL DEFAULT 0,
  report_count      INTEGER NOT NULL DEFAULT 0,

  -- Moderation
  is_hidden         BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.comments IS
  'Nested anonymous comments — max depth 5.';

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post     ON public.comments(post_id, created_at DESC) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_comments_parent   ON public.comments(parent_comment_id) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_comments_author   ON public.comments(author_id) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_comments_score    ON public.comments(post_id, score DESC) WHERE NOT is_deleted;

-- ============================================================
-- TABLE: votes
-- One row per user per post OR comment (not both)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id     UUID REFERENCES public.posts(id)    ON DELETE CASCADE,
  comment_id  UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_value  SMALLINT NOT NULL CHECK (vote_value IN (1, -1)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A vote must target exactly one of: post or comment
  CONSTRAINT vote_single_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  -- One vote per user per post
  CONSTRAINT unique_post_vote    UNIQUE (user_id, post_id),
  -- One vote per user per comment
  CONSTRAINT unique_comment_vote UNIQUE (user_id, comment_id)
);

COMMENT ON TABLE public.votes IS
  'Upvotes and downvotes on posts and comments. One per user per target.';

-- Indexes for votes
CREATE INDEX IF NOT EXISTS idx_votes_post    ON public.votes(post_id)    WHERE post_id    IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_comment ON public.votes(comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_user    ON public.votes(user_id);

-- ============================================================
-- TABLE: bookmarks
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES public.posts(id)     ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_bookmark UNIQUE (user_id, post_id)
);

COMMENT ON TABLE public.bookmarks IS 'Saved posts per user.';

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id, created_at DESC);

-- ============================================================
-- TABLE: reports
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type report_target NOT NULL,
  target_id   UUID NOT NULL,
  reason      report_reason NOT NULL,
  details     TEXT CHECK (char_length(details) <= 1000),
  status      report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One report per user per target
  CONSTRAINT unique_report UNIQUE (reporter_id, target_type, target_id)
);

COMMENT ON TABLE public.reports IS
  'Content reports — one per user per target (post or comment).';

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);

-- ============================================================
-- TABLE: notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type                notification_type NOT NULL,
  related_post_id     UUID REFERENCES public.posts(id)    ON DELETE CASCADE,
  related_comment_id  UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS
  'User notifications — anonymous, no sender info stored.';

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE NOT is_read;

-- ============================================================
-- TABLE: admin_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      admin_action NOT NULL,
  target_type TEXT,
  target_id   UUID,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.admin_logs IS 'Audit log of all admin actions.';

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin  ON public.admin_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON public.admin_logs(target_type, target_id);
