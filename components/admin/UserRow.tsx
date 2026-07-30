'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ShieldAlert, CheckCircle, Ban, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

interface UserRowProps {
  user: Profile
}

export default function UserRow({ user }: UserRowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSuspended, setIsSuspended] = useState(user.is_suspended)
  const [modalOpen, setModalOpen] = useState(false)
  const [reason, setReason] = useState(user.suspended_reason ?? '')

  async function handleToggleSuspend() {
    if (isPending) return

    startTransition(async () => {
      try {
        const nextState = !isSuspended
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            is_suspended: nextState,
            suspended_reason: nextState ? reason.trim() || 'Violated community guidelines' : null,
          }),
        })

        if (!res.ok) throw new Error('Failed to update user status')

        setIsSuspended(nextState)
        setModalOpen(false)
        toast.success(nextState ? 'User suspended' : 'User unsuspended')
        router.refresh()
      } catch {
        toast.error('Failed to update user status')
      }
    })
  }

  // Mask email for domain display e.g. j***n@university.edu
  const [local, domain] = user.email.split('@')
  const maskedEmail = `${local.charAt(0)}***${local.slice(-1)}@${domain}`

  return (
    <>
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-ink">{maskedEmail}</span>
            {user.is_admin && (
              <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold px-2 py-0.5">
                ADMIN
              </span>
            )}
            {isSuspended ? (
              <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5">
                SUSPENDED
              </span>
            ) : (
              <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold px-2 py-0.5">
                ACTIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-subtle">
            <span>Posts: {user.post_count}</span>
            <span>Comments: {user.comment_count}</span>
            <span>Joined: {formatDate(user.created_at)}</span>
          </div>
          {isSuspended && user.suspended_reason && (
            <p className="text-xs text-red-400 mt-1">
              Reason: {user.suspended_reason}
            </p>
          )}
        </div>

        {/* Action */}
        {!user.is_admin && (
          <button
            onClick={() => {
              if (isSuspended) handleToggleSuspend()
              else setModalOpen(true)
            }}
            disabled={isPending}
            className={cn(
              'btn-xs shrink-0 self-start sm:self-center',
              isSuspended ? 'btn-secondary text-green-400' : 'btn-danger'
            )}
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : isSuspended ? (
              <>
                <CheckCircle className="size-3" /> Unsuspend User
              </>
            ) : (
              <>
                <Ban className="size-3" /> Suspend User
              </>
            )}
          </button>
        )}
      </div>

      {/* Suspension Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Suspend User Account"
        description={`This will prevent ${maskedEmail} from posting, commenting, or voting.`}
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="suspension-reason" className="block text-xs font-semibold text-ink-muted uppercase">
              Reason for Suspension
            </label>
            <input
              id="suspension-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Repeated harassment or spam"
              className="input text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-secondary btn-sm"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleToggleSuspend}
              disabled={isPending}
              className="btn-danger btn-sm"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : 'Confirm Suspension'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
