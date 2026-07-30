'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { toast } from 'react-hot-toast'

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  onDeleted: () => void
  postId: string
  title?: string
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onDeleted,
  postId,
  title,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message ?? 'Failed to delete post')
      }

      toast.success('Post deleted successfully')
      onDeleted()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Post">
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertTriangle className="size-5 mt-0.5 shrink-0" />
          <div className="text-xs leading-relaxed space-y-1">
            <p className="font-semibold text-red-300">Are you sure you want to delete this post?</p>
            <p className="text-red-400/80">
              This action cannot be undone. Your anonymous post will be permanently hidden from the campus feed.
            </p>
          </div>
        </div>

        {title && (
          <div className="p-3 rounded-xl bg-card border border-card-border">
            <p className="text-xs text-ink-subtle mb-1">Post Title:</p>
            <p className="text-sm font-semibold text-ink line-clamp-2">{title}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-card-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn-ghost btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-danger btn-sm flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              'Delete Post'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
