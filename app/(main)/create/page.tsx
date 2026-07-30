import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/server'
import CreatePostForm from '@/components/posts/CreatePostForm'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Create Post — CampusWhisper',
  description: 'Share a secret, ask a question, or start a discussion anonymously.',
}

export default async function CreatePostPage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login?next=/create')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-400 text-xs font-semibold mb-2">
          <Sparkles className="size-3" />
          100% Anonymous
        </div>
        <h1 className="text-2xl font-bold text-ink">Create a Post</h1>
        <p className="text-sm text-ink-muted mt-1">
          Your identity is completely hidden. An anonymous tag like #A1B2 will be assigned for this post.
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-6">
        <CreatePostForm />
      </div>
    </div>
  )
}
