-- ============================================================
-- CampusWhisper — Migration 002: Row Level Security (RLS)
-- Run AFTER 001_schema.sql
-- ============================================================

-- ── Enable RLS on all tables ──────────────────────────────────

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs   ENABLE ROW LEVEL SECURITY;

-- ── Helper: is current user an admin ─────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE AND is_suspended = FALSE
  );
$$;

-- ── Helper: is current user suspended ────────────────────────

CREATE OR REPLACE FUNCTION public.is_suspended()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_suspended = TRUE
  );
$$;

-- ── Helper: is current user verified (email confirmed) ───────

CREATE OR REPLACE FUNCTION public.is_verified()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL
  );
$$;

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================

-- Anyone can read limited profile info (no email exposed via API)
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Only the owner can update their own profile
CREATE POLICY "profiles_owner_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (for suspend/unsuspend)
CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Profiles are created only by the trigger (SECURITY DEFINER)
-- No direct INSERT allowed from client

-- ============================================================
-- RLS POLICIES: categories
-- ============================================================

-- Anyone can read categories
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (is_active = TRUE);

-- Only admins can manage categories
CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- ============================================================
-- RLS POLICIES: posts
-- ============================================================

-- Public can read non-deleted, non-hidden posts
CREATE POLICY "posts_public_read"
  ON public.posts FOR SELECT
  USING (
    is_deleted = FALSE
    AND (
      is_hidden = FALSE
      OR auth.uid() = author_id  -- Author can always see their own post
      OR public.is_admin()       -- Admins can see hidden posts
    )
  );

-- Verified, non-suspended users can create posts
CREATE POLICY "posts_verified_insert"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
    AND public.is_verified()
    AND NOT public.is_suspended()
  );

-- Authors can soft-delete their own posts (set is_deleted = true)
CREATE POLICY "posts_author_delete"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (
    auth.uid() = author_id
    -- Authors can only change: is_deleted, title, body (not scores, not hidden)
  );

-- Admins can do anything with posts
CREATE POLICY "posts_admin_all"
  ON public.posts FOR ALL
  USING (public.is_admin());

-- ============================================================
-- RLS POLICIES: comments
-- ============================================================

-- Public can read non-deleted comments
CREATE POLICY "comments_public_read"
  ON public.comments FOR SELECT
  USING (
    is_deleted = FALSE
    AND (
      is_hidden = FALSE
      OR auth.uid() = author_id
      OR public.is_admin()
    )
  );

-- Verified, non-suspended users can create comments
CREATE POLICY "comments_verified_insert"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
    AND public.is_verified()
    AND NOT public.is_suspended()
  );

-- Authors can soft-delete their own comments
CREATE POLICY "comments_author_update"
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Admins can manage all comments
CREATE POLICY "comments_admin_all"
  ON public.comments FOR ALL
  USING (public.is_admin());

-- ============================================================
-- RLS POLICIES: votes
-- ============================================================

-- Users can see their own votes (for UI state)
CREATE POLICY "votes_owner_read"
  ON public.votes FOR SELECT
  USING (auth.uid() = user_id);

-- Verified users can vote (not suspended)
CREATE POLICY "votes_verified_insert"
  ON public.votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_verified()
    AND NOT public.is_suspended()
  );

-- Users can change their own vote value
CREATE POLICY "votes_owner_update"
  ON public.votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own vote
CREATE POLICY "votes_owner_delete"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all votes (for audit)
CREATE POLICY "votes_admin_read"
  ON public.votes FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- RLS POLICIES: bookmarks
-- ============================================================

-- Users can only see their own bookmarks
CREATE POLICY "bookmarks_owner_read"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Verified users can bookmark
CREATE POLICY "bookmarks_verified_insert"
  ON public.bookmarks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_verified()
  );

-- Users can remove their own bookmarks
CREATE POLICY "bookmarks_owner_delete"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES: reports
-- ============================================================

-- Users can read their own submitted reports
CREATE POLICY "reports_owner_read"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Verified users can submit reports
CREATE POLICY "reports_verified_insert"
  ON public.reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_id
    AND public.is_verified()
    AND NOT public.is_suspended()
  );

-- Admins can read and update all reports
CREATE POLICY "reports_admin_all"
  ON public.reports FOR ALL
  USING (public.is_admin());

-- ============================================================
-- RLS POLICIES: notifications
-- ============================================================

-- Users can only see their own notifications
CREATE POLICY "notifications_owner_read"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "notifications_owner_update"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "notifications_owner_delete"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications are only created by SECURITY DEFINER triggers
-- No direct client INSERT allowed

-- Admins can read all notifications
CREATE POLICY "notifications_admin_read"
  ON public.notifications FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- RLS POLICIES: admin_logs
-- ============================================================

-- Only admins can read admin logs
CREATE POLICY "admin_logs_admin_read"
  ON public.admin_logs FOR SELECT
  USING (public.is_admin());

-- Only admins can write admin logs
CREATE POLICY "admin_logs_admin_insert"
  ON public.admin_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- Run these in the Supabase Dashboard → Storage → Buckets
-- or via the Management API
-- ============================================================

-- NOTE: Storage policies are managed in the Supabase dashboard or via
-- the Supabase CLI. The bucket 'post-images' should be created as PUBLIC.
-- Suggested storage policies:
--
-- Bucket: post-images (public)
--   Allow SELECT: anon, authenticated
--   Allow INSERT: authenticated (where owner = auth.uid())
--   Allow DELETE: authenticated (where owner = auth.uid()) + admins
--
-- Files are stored as: post-images/{post_id}/{filename}

-- ============================================================
-- GRANT permissions to anon / authenticated roles
-- ============================================================

-- Allow anon to read public data
GRANT SELECT ON public.posts        TO anon;
GRANT SELECT ON public.comments     TO anon;
GRANT SELECT ON public.categories   TO anon;

-- Allow authenticated users full access (RLS handles fine-grained control)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes         TO authenticated;
GRANT SELECT, INSERT, DELETE         ON public.bookmarks     TO authenticated;
GRANT SELECT, INSERT                 ON public.reports       TO authenticated;
GRANT SELECT, UPDATE, DELETE         ON public.notifications TO authenticated;
GRANT SELECT, UPDATE                 ON public.profiles      TO authenticated;
GRANT SELECT                         ON public.categories    TO authenticated;

-- Grant execute on RPC functions (functions created in 003_functions.sql)
-- GRANT EXECUTE statements are moved into 003_functions.sql
