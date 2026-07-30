import type { Metadata } from 'next'
import Link from 'next/link'
import { Grid3X3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

export const metadata: Metadata = {
  title: 'Categories — CampusWhisper',
  description: 'Browse all campus discussion categories.',
}

export const revalidate = 3600

// Lucide icon name → emoji fallback map for server render
const CATEGORY_EMOJI: Record<string, string> = {
  gossip: '🔥', confessions: '💛', memes: '😂', questions: '❓',
  relationships: '💔', 'campus-news': '📰', clubs: '🎭',
  events: '🎉', 'lost-and-found': '🔍', marketplace: '🛒', rants: '⚡',
}

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-2xl bg-primary-600/10">
          <Grid3X3 className="size-5 text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Categories</h1>
          <p className="text-xs text-ink-subtle">Browse discussions by topic</p>
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(categories as Category[])?.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="card card-hover group p-5 block transition-all duration-200"
            style={{ borderColor: `${cat.color}20` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Emoji icon */}
                <div
                  className="flex items-center justify-center size-11 rounded-2xl text-2xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {CATEGORY_EMOJI[cat.slug] ?? '💬'}
                </div>
                <div>
                  <h2
                    className="font-semibold text-sm text-ink group-hover:transition-colors"
                    style={{ color: cat.color }}
                  >
                    {cat.name}
                  </h2>
                  <p className="text-xs text-ink-subtle mt-0.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Post count */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-ink">{cat.post_count.toLocaleString()}</p>
                <p className="text-[10px] text-ink-subtle">posts</p>
              </div>
            </div>

            {/* Colored bottom accent bar */}
            <div
              className="h-0.5 rounded-full mt-4 opacity-30 group-hover:opacity-60 transition-opacity"
              style={{ backgroundColor: cat.color }}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
