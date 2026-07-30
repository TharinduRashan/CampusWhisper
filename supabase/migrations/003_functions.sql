-- ============================================================
-- CampusWhisper — Migration 003: Database Functions & Triggers
-- Run AFTER 001_schema.sql and 002_rls.sql
-- ============================================================

-- ============================================================
-- FUNCTION: handle_new_user
-- Auto-creates a profile row when a new auth.users entry appears
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: fire on every new Supabase auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: update_post_scores
-- Recalculates post upvotes / downvotes / score after vote change
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_post_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_post_id UUID;
BEGIN
  -- Determine which post to update
  IF TG_OP = 'DELETE' THEN
    target_post_id := OLD.post_id;
  ELSE
    target_post_id := NEW.post_id;
  END IF;

  IF target_post_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.posts
  SET
    upvotes   = (SELECT COUNT(*) FROM public.votes WHERE post_id = target_post_id AND vote_value = 1),
    downvotes = (SELECT COUNT(*) FROM public.votes WHERE post_id = target_post_id AND vote_value = -1),
    score     = (SELECT COALESCE(SUM(vote_value), 0) FROM public.votes WHERE post_id = target_post_id),
    updated_at = NOW()
  WHERE id = target_post_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_post_vote_change ON public.votes;
CREATE TRIGGER on_post_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_scores();

-- ============================================================
-- FUNCTION: update_comment_scores
-- Recalculates comment upvotes / downvotes / score after vote change
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_comment_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_comment_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_comment_id := OLD.comment_id;
  ELSE
    target_comment_id := NEW.comment_id;
  END IF;

  IF target_comment_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.comments
  SET
    upvotes   = (SELECT COUNT(*) FROM public.votes WHERE comment_id = target_comment_id AND vote_value = 1),
    downvotes = (SELECT COUNT(*) FROM public.votes WHERE comment_id = target_comment_id AND vote_value = -1),
    score     = (SELECT COALESCE(SUM(vote_value), 0) FROM public.votes WHERE comment_id = target_comment_id),
    updated_at = NOW()
  WHERE id = target_comment_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_comment_vote_change ON public.votes;
CREATE TRIGGER on_comment_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_scores();

-- ============================================================
-- FUNCTION: update_post_comment_count
-- Increments/decrements post.comment_count when comments change
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comment_count = comment_count + 1, updated_at = NOW()
    WHERE id = NEW.post_id;

    -- Also update parent comment reply_count if it's a reply
    IF NEW.parent_comment_id IS NOT NULL THEN
      UPDATE public.comments
      SET reply_count = reply_count + 1
      WHERE id = NEW.parent_comment_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    -- Soft delete: decrement count
    UPDATE public.posts
    SET comment_count = GREATEST(0, comment_count - 1), updated_at = NOW()
    WHERE id = NEW.post_id;

    IF NEW.parent_comment_id IS NOT NULL THEN
      UPDATE public.comments
      SET reply_count = GREATEST(0, reply_count - 1)
      WHERE id = NEW.parent_comment_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

-- ============================================================
-- FUNCTION: update_category_post_count
-- Keeps categories.post_count in sync
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_category_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.categories SET post_count = post_count + 1 WHERE id = NEW.category_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    UPDATE public.categories SET post_count = GREATEST(0, post_count - 1) WHERE id = NEW.category_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.categories SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.category_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_post_category_change ON public.posts;
CREATE TRIGGER on_post_category_change
  AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_category_post_count();

-- ============================================================
-- FUNCTION: update_profile_post_count
-- Keeps profiles.post_count in sync
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_profile_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET post_count = post_count + 1 WHERE id = NEW.author_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    UPDATE public.profiles SET post_count = GREATEST(0, post_count - 1) WHERE id = NEW.author_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_post_author_change ON public.posts;
CREATE TRIGGER on_post_author_change
  AFTER INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_post_count();

-- ============================================================
-- FUNCTION: update_post_search_vector
-- Maintains the tsvector column for full-text search
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_post_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.body, '')),  'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_post_search_update ON public.posts;
CREATE TRIGGER on_post_search_update
  BEFORE INSERT OR UPDATE OF title, body ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_post_search_vector();

-- ============================================================
-- FUNCTION: auto_hide_post_on_reports
-- Hides a post when report_count exceeds threshold
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_hide_post_on_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  threshold INTEGER := 5; -- configurable
  current_count INTEGER;
BEGIN
  -- Only act on new reports targeting posts
  IF NEW.target_type = 'post' AND NEW.status = 'pending' THEN
    SELECT report_count INTO current_count
    FROM public.posts
    WHERE id = NEW.target_id;

    UPDATE public.posts
    SET report_count = report_count + 1
    WHERE id = NEW.target_id;

    -- Auto-hide if threshold crossed
    IF (current_count + 1) >= threshold THEN
      UPDATE public.posts
      SET
        is_hidden     = TRUE,
        hidden_reason = 'Auto-hidden: exceeded report threshold. Pending admin review.'
      WHERE id = NEW.target_id AND NOT is_hidden;
    END IF;

  ELSIF NEW.target_type = 'comment' AND NEW.status = 'pending' THEN
    UPDATE public.comments
    SET report_count = report_count + 1
    WHERE id = NEW.target_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_report ON public.reports;
CREATE TRIGGER on_new_report
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.auto_hide_post_on_reports();

-- ============================================================
-- FUNCTION: calculate_trending_score
-- Hot-ranking: Wilson score / time-decay hybrid
-- score = (upvotes - downvotes) / (age_hours + 2)^1.8
-- ============================================================

CREATE OR REPLACE FUNCTION public.calculate_trending_score(
  p_score    INTEGER,
  p_comments INTEGER,
  p_created  TIMESTAMPTZ
)
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  age_hours FLOAT;
  gravity   FLOAT := 1.8;
BEGIN
  age_hours := GREATEST(
    EXTRACT(EPOCH FROM (NOW() - p_created)) / 3600.0,
    0
  );
  RETURN (p_score + (p_comments * 0.5)) / POWER(age_hours + 2, gravity);
END;
$$;

-- ============================================================
-- FUNCTION: refresh_trending_scores
-- Updates all posts' trending_score — meant to be called periodically
-- ============================================================

CREATE OR REPLACE FUNCTION public.refresh_trending_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET trending_score = public.calculate_trending_score(score, comment_count, created_at)
  WHERE NOT is_deleted AND NOT is_hidden;
END;
$$;

-- ============================================================
-- FUNCTION: get_feed_posts
-- Paginated feed with multiple sort modes
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_feed_posts(
  p_sort        TEXT    DEFAULT 'hot',      -- hot | new | top_today | top_week | top_month | top_all
  p_category_id INTEGER DEFAULT NULL,
  p_limit       INTEGER DEFAULT 20,
  p_offset      INTEGER DEFAULT 0
)
RETURNS TABLE (
  id            UUID,
  title         TEXT,
  body          TEXT,
  image_url     TEXT,
  category_id   INTEGER,
  score         INTEGER,
  upvotes       INTEGER,
  downvotes     INTEGER,
  comment_count INTEGER,
  trending_score FLOAT,
  created_at    TIMESTAMPTZ,
  category_name TEXT,
  category_slug TEXT,
  category_color TEXT,
  category_icon TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.body, p.image_url, p.category_id,
    p.score, p.upvotes, p.downvotes, p.comment_count, p.trending_score, p.created_at,
    c.name AS category_name,
    c.slug AS category_slug,
    c.color AS category_color,
    c.icon  AS category_icon
  FROM public.posts p
  JOIN public.categories c ON c.id = p.category_id
  WHERE
    p.is_deleted = FALSE
    AND p.is_hidden = FALSE
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND CASE p_sort
      WHEN 'top_today' THEN p.created_at >= NOW() - INTERVAL '1 day'
      WHEN 'top_week'  THEN p.created_at >= NOW() - INTERVAL '7 days'
      WHEN 'top_month' THEN p.created_at >= NOW() - INTERVAL '30 days'
      ELSE TRUE
    END
  ORDER BY
    CASE p_sort
      WHEN 'hot'       THEN p.trending_score
      WHEN 'new'       THEN EXTRACT(EPOCH FROM p.created_at)
      WHEN 'top_today' THEN p.score::FLOAT
      WHEN 'top_week'  THEN p.score::FLOAT
      WHEN 'top_month' THEN p.score::FLOAT
      WHEN 'top_all'   THEN p.score::FLOAT
      ELSE p.trending_score
    END DESC NULLS LAST
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================================
-- FUNCTION: get_trending_posts
-- Returns top N trending posts (for Trending page)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_trending_posts(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id             UUID,
  title          TEXT,
  body           TEXT,
  image_url      TEXT,
  category_id    INTEGER,
  score          INTEGER,
  comment_count  INTEGER,
  trending_score FLOAT,
  created_at     TIMESTAMPTZ,
  category_name  TEXT,
  category_slug  TEXT,
  category_color TEXT,
  category_icon  TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.body, p.image_url, p.category_id,
    p.score, p.comment_count, p.trending_score, p.created_at,
    c.name, c.slug, c.color, c.icon
  FROM public.posts p
  JOIN public.categories c ON c.id = p.category_id
  WHERE
    p.is_deleted = FALSE
    AND p.is_hidden = FALSE
    AND p.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY p.trending_score DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================
-- FUNCTION: search_posts
-- Full-text search with trigram fallback
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_posts(
  p_query       TEXT,
  p_category_id INTEGER DEFAULT NULL,
  p_limit       INTEGER DEFAULT 20,
  p_offset      INTEGER DEFAULT 0
)
RETURNS TABLE (
  id            UUID,
  title         TEXT,
  body          TEXT,
  image_url     TEXT,
  category_id   INTEGER,
  score         INTEGER,
  comment_count INTEGER,
  created_at    TIMESTAMPTZ,
  category_name TEXT,
  category_slug TEXT,
  category_color TEXT,
  category_icon TEXT,
  rank          FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  query_tsv TSQUERY;
BEGIN
  query_tsv := websearch_to_tsquery('english', p_query);

  RETURN QUERY
  SELECT
    p.id, p.title, p.body, p.image_url, p.category_id,
    p.score, p.comment_count, p.created_at,
    c.name, c.slug, c.color, c.icon,
    ts_rank(p.search_vector, query_tsv) AS rank
  FROM public.posts p
  JOIN public.categories c ON c.id = p.category_id
  WHERE
    p.is_deleted = FALSE
    AND p.is_hidden = FALSE
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (
      p.search_vector @@ query_tsv
      OR p.title ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, p.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================================
-- FUNCTION: get_admin_stats
-- Returns site-wide statistics for the admin dashboard
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_users      BIGINT,
  verified_users   BIGINT,
  suspended_users  BIGINT,
  total_posts      BIGINT,
  total_comments   BIGINT,
  total_votes      BIGINT,
  pending_reports  BIGINT,
  posts_today      BIGINT,
  comments_today   BIGINT,
  new_users_today  BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.profiles)::BIGINT,
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL)::BIGINT,
    (SELECT COUNT(*) FROM public.profiles WHERE is_suspended = TRUE)::BIGINT,
    (SELECT COUNT(*) FROM public.posts    WHERE NOT is_deleted)::BIGINT,
    (SELECT COUNT(*) FROM public.comments WHERE NOT is_deleted)::BIGINT,
    (SELECT COUNT(*) FROM public.votes)::BIGINT,
    (SELECT COUNT(*) FROM public.reports  WHERE status = 'pending')::BIGINT,
    (SELECT COUNT(*) FROM public.posts    WHERE created_at >= NOW() - INTERVAL '1 day' AND NOT is_deleted)::BIGINT,
    (SELECT COUNT(*) FROM public.comments WHERE created_at >= NOW() - INTERVAL '1 day' AND NOT is_deleted)::BIGINT,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '1 day')::BIGINT;
END;
$$;

-- ============================================================
-- FUNCTION: notify_post_author
-- Creates a notification for the post author when someone comments
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author UUID;
  parent_author UUID;
BEGIN
  -- Only fire on new (non-deleted) comments
  IF TG_OP != 'INSERT' THEN RETURN NEW; END IF;

  -- Notify post author (if they didn't write this comment themselves)
  SELECT author_id INTO post_author FROM public.posts WHERE id = NEW.post_id;
  IF post_author IS NOT NULL AND post_author != NEW.author_id THEN
    INSERT INTO public.notifications (user_id, type, related_post_id, related_comment_id)
    VALUES (post_author, 'post_reply', NEW.post_id, NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Notify parent comment author (if it's a reply)
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT author_id INTO parent_author FROM public.comments WHERE id = NEW.parent_comment_id;
    IF parent_author IS NOT NULL AND parent_author != NEW.author_id THEN
      INSERT INTO public.notifications (user_id, type, related_post_id, related_comment_id)
      VALUES (parent_author, 'comment_reply', NEW.post_id, NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_comment_notify ON public.comments;
CREATE TRIGGER on_new_comment_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- ============================================================
-- FUNCTION: updated_at trigger (generic)
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION public.get_feed_posts(TEXT, INTEGER, INTEGER, INTEGER)     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_posts(INTEGER)                         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_posts(TEXT, INTEGER, INTEGER, INTEGER)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats()                                   TO authenticated;

