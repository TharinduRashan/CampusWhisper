# CampusWhisper 🎓

> Anonymous campus discussion platform for verified university students.

Built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

---

## ✨ Features

- 🔒 **100% Anonymous** — No usernames, no profiles. Just `Anonymous #XXXX` aliases
- 🎓 **University Email Verified** — Only students with valid uni emails can post
- ⬆️ **Voting** — Upvote / downvote posts and comments (one vote per user)
- 💬 **Nested Comments** — Threaded replies up to 5 levels deep
- 🏷️ **11 Categories** — Gossip, Confessions, Memes, Questions, and more
- 🔥 **Trending Feed** — Hot / New / Top sorting with time-decay algorithm
- 🔍 **Full-Text Search** — Search across post titles and content
- 🔔 **Notifications** — Anonymous alerts for replies to your posts/comments
- 🔖 **Bookmarks** — Save posts for later
- 🌙 **Dark Mode** — Default dark theme with light mode toggle
- 🛡️ **Admin Dashboard** — Moderation queue, user management, site stats
- 📱 **Mobile-First** — Feels like a native app on mobile

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)

---

### 1. Clone & Install

```bash
git clone https://github.com/your-org/campus-whisper.git
cd campus-whisper
npm install
```

---

### 2. Set Up Supabase

#### a. Create a new Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose a name, password, and region
4. Wait for it to provision (~2 minutes)

#### b. Run database migrations

Open **SQL Editor** in your Supabase dashboard and run the migrations **in order**:

```
supabase/migrations/001_schema.sql   ← Tables, indexes, enums
supabase/migrations/002_rls.sql      ← Row Level Security policies
supabase/migrations/003_functions.sql ← Triggers, functions, RPCs
```

Then run the seed data:

```
supabase/seed.sql                    ← Categories + sample data
```

#### c. Configure Supabase Auth

1. Go to **Authentication → Providers → Email**
2. Enable **Confirm Email** (required for university verification)
3. Set **Site URL** to `http://localhost:3000` (development)
4. Add `http://localhost:3000/auth/callback` to **Redirect URLs**

For production, also add your Vercel domain.

#### d. Create the image storage bucket

1. Go to **Storage → New Bucket**
2. Name: `post-images`
3. Set to **Public**
4. Add these policies:
   - `SELECT`: Allow for `anon` and `authenticated`
   - `INSERT`: Allow for `authenticated` where `(storage.foldername(name))[1] = auth.uid()::text`
   - `DELETE`: Allow for `authenticated` where owner matches

#### e. Get your API keys

Go to **Settings → API** and copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` *(keep secret!)*

---

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CampusWhisper

# Allowed university email domains (comma-separated)
ALLOWED_EMAIL_DOMAINS=.edu,.ac.uk,.ac.lk

# Reports before auto-hiding a post
REPORT_THRESHOLD=5

# Admin email addresses (comma-separated)
ADMIN_EMAILS=admin@youruniversity.edu
```

---

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

### 5. Make Yourself an Admin

After signing up, run this in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'your-email@university.edu';
```

---

## 🗄️ Database Schema

```
profiles         ← Extended user info (no public identity)
categories       ← 11 post categories
posts            ← Anonymous posts with soft-delete
comments         ← Nested comments (max depth 5)
votes            ← Upvotes/downvotes (one per user per target)
bookmarks        ← Saved posts per user
reports          ← Content reports with status workflow
notifications    ← Anonymous reply notifications
admin_logs       ← Audit trail of all admin actions
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| `author_id` never exposed in API | Identity stays server-side only |
| Anonymous alias = `hash(post_id + user_id)` | Same commenter = same alias within a thread |
| Soft deletes (`is_deleted`) | Preserve vote/comment counts, audit trail |
| Aggregated counters (`score`, `comment_count`) | Fast reads without joins |
| `search_vector` tsvector column | Fast full-text search without external service |
| Time-decay trending score | Reddit-style "hot" ranking |

---

## 🛡️ Security

- **Row Level Security** on every table — enforced at the database level
- **Email verification required** before any write action
- **Suspended users** blocked at middleware level
- **Service role key** only used server-side in admin routes
- **Rate limiting** via Vercel middleware (configurable)
- **Image validation** — MIME type checked on upload

---

## 📁 Project Structure

```
campuswhisper/
├── app/
│   ├── (auth)/           # Login, signup, verify pages
│   ├── (main)/           # Main app pages (home, trending, etc.)
│   ├── admin/            # Admin dashboard
│   ├── api/              # API route handlers
│   └── auth/callback/    # Supabase auth callback
├── components/
│   ├── layout/           # Navbar, Sidebar, MobileNav
│   ├── posts/            # PostCard, PostList, CreatePostForm
│   ├── comments/         # CommentThread, CommentCard
│   ├── votes/            # VoteButtons
│   ├── ui/               # Reusable primitives
│   └── admin/            # Admin dashboard components
├── lib/
│   ├── supabase/         # Client, server, admin Supabase clients
│   ├── utils.ts          # Helpers (cn, formatDate, etc.)
│   ├── alias.ts          # Anonymous alias generator
│   └── constants.ts      # Categories, sort options, reasons
├── types/
│   └── index.ts          # TypeScript interfaces
└── supabase/
    ├── migrations/       # SQL migration files (run in order)
    └── seed.sql          # Initial data
```

---

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local`
4. Set **Root Directory** to `/` (default)
5. Deploy!

Update your Supabase Auth **Site URL** and **Redirect URLs** to your Vercel domain.

---

## 📋 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run type-check` | Run TypeScript checks |

---

## 🗺️ Roadmap

- [ ] Anonymous polls
- [ ] GIF support (Tenor/Giphy integration)
- [ ] Hashtag system
- [ ] Campus-specific sub-communities
- [ ] Real-time updates (Supabase Realtime)
- [ ] Progressive Web App (PWA)
- [ ] Event calendar
- [ ] Pinned announcements

---

## 📜 License

MIT — free to use, modify, and self-host for your university.

---

## 🤝 Community Guidelines

- No doxxing or sharing private information
- No harassment or hate speech
- No illegal content
- No impersonation
- Discuss freely, respect others

Full guidelines at `/guidelines` in the app.
# CampusWhisper
# CampusWhisper
# CampusWhisper
