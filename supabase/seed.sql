-- ============================================================
-- CampusWhisper — Seed Data
-- Run AFTER all migrations (001, 002, 003)
-- ============================================================

-- ── Categories ────────────────────────────────────────────────

INSERT INTO public.categories (name, slug, description, color, icon, sort_order) VALUES
  ('Gossip',        'gossip',        'Campus gossip, tea, and drama worth talking about.',         '#ec4899', 'Flame',          1),
  ('Confessions',   'confessions',   'Anonymous confessions — your secrets are safe here.',        '#f59e0b', 'Heart',          2),
  ('Memes',         'memes',         'Campus memes, jokes, and funny moments.',                    '#10b981', 'Smile',          3),
  ('Questions',     'questions',     'Ask anything about campus life, courses, or student life.',  '#3b82f6', 'HelpCircle',     4),
  ('Relationships', 'relationships', 'Dating, crushes, heartbreaks, and everything in between.',   '#f43f5e', 'HeartHandshake', 5),
  ('Campus News',   'campus-news',   'Latest updates, announcements, and university news.',        '#8b5cf6', 'Newspaper',      6),
  ('Clubs',         'clubs',         'Student clubs, societies, and organizations.',               '#06b6d4', 'Users',          7),
  ('Events',        'events',        'Upcoming events, parties, and things to do on campus.',      '#f97316', 'Calendar',       8),
  ('Lost & Found',  'lost-and-found','Lost something? Found something? Post it here.',             '#6366f1', 'Search',         9),
  ('Marketplace',   'marketplace',   'Buy, sell, and trade with fellow students.',                 '#84cc16', 'ShoppingBag',   10),
  ('Rants',         'rants',         'Let it out — vent about anything campus-related.',           '#ef4444', 'Zap',           11)
ON CONFLICT (slug) DO NOTHING;

-- ── Sample Posts (for development — requires a real auth user) ─
-- These are commented out because they need a valid author_id from auth.users.
-- Uncomment and replace {USER_UUID} after creating a test user in Supabase Auth.

/*
DO $$
DECLARE
  test_user_id UUID := '{USER_UUID}';  -- Replace with your test user's UUID
  gossip_id    INTEGER;
  confess_id   INTEGER;
  memes_id     INTEGER;
  questions_id INTEGER;
  rants_id     INTEGER;
BEGIN
  SELECT id INTO gossip_id    FROM public.categories WHERE slug = 'gossip';
  SELECT id INTO confess_id   FROM public.categories WHERE slug = 'confessions';
  SELECT id INTO memes_id     FROM public.categories WHERE slug = 'memes';
  SELECT id INTO questions_id FROM public.categories WHERE slug = 'questions';
  SELECT id INTO rants_id     FROM public.categories WHERE slug = 'rants';

  -- Insert sample posts
  INSERT INTO public.posts (title, body, category_id, author_id, score, comment_count, created_at) VALUES
  (
    'The library AC is broken AGAIN and nobody cares 😭',
    'Third week in a row. Finals are in two weeks. The temperature in the reading room is unbearable. I filed a complaint but nothing happened. Anyone else suffering?',
    rants_id, test_user_id, 142, 34,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'Saw two professors fighting in the parking lot',
    'Not going to name names but it was wild. One of them was definitely from the CS department. The other... let''s just say they teach something very different. Witnesses?',
    gossip_id, test_user_id, 287, 56,
    NOW() - INTERVAL '5 hours'
  ),
  (
    'I have a crush on someone in my Thursday 9am lecture',
    'We''ve made eye contact like 3 times but I''m too nervous to talk. They always have a coffee from the blue café. If you''re reading this... hi 👋',
    confess_id, test_user_id, 98, 22,
    NOW() - INTERVAL '1 day'
  ),
  (
    'How do you survive 8am lectures?',
    'I genuinely don''t understand how some people show up looking fresh at 8am. What''s your routine? I''ve tried everything — sleep early, alarm, cold shower. Nothing works.',
    questions_id, test_user_id, 63, 41,
    NOW() - INTERVAL '3 hours'
  ),
  (
    'The cafeteria pasta is a war crime',
    'I don''t want to be dramatic but whatever they''re serving as "pasta carbonara" should be reported to the ICC. Someone had to say it.',
    memes_id, test_user_id, 512, 87,
    NOW() - INTERVAL '6 hours'
  );
END $$;
*/

-- ── Verify seed ───────────────────────────────────────────────

SELECT
  id,
  name,
  slug,
  color,
  icon,
  sort_order
FROM public.categories
ORDER BY sort_order;
