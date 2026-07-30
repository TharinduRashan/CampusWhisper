'use client'

import { useState, useTransition } from 'react'
import { Flag, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { REPORT_REASONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ReportReason } from '@/types'

interface ReportModalProps {
  open: boolean
  onClose: () => void
  targetId: string
  targetType: 'post' | 'comment'
}

export default function ReportModal({
  open,
  onClose,
  targetId,
  targetType,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleClose() {
    if (isPending) return
    setSelectedReason(null)
    setDetails('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedReason) {
      setError('Please select a reason.')
      return
    }
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_id: targetId,
            target_type: targetType,
            reason: selectedReason,
            details: details.trim() || undefined,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error?.message ?? 'Failed to submit report')
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit report')
      }
    })
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Report Content"
      description={`Help us keep CampusWhisper safe by reporting this ${targetType}.`}
    >
      {success ? (
        /* Success state */
        <div className="py-4 text-center space-y-4">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="size-7 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-ink">Report submitted</p>
            <p className="text-sm text-ink-muted mt-1">
              Thank you. Our moderation team will review it shortly.
            </p>
          </div>
          <button onClick={handleClose} className="btn-primary btn-sm">
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reason selection */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-ink-muted mb-3">
              Why are you reporting this?
            </legend>
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason.value}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150',
                  selectedReason === reason.value
                    ? 'border-primary-500 bg-primary-600/10'
                    : 'border-card-border hover:border-card-border/80 hover:bg-card-hover'
                )}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={() => {
                    setSelectedReason(reason.value)
                    setError(null)
                  }}
                  className="mt-0.5 accent-violet-600 shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-ink">{reason.label}</p>
                  <p className="text-xs text-ink-subtle mt-0.5">{reason.description}</p>
                </div>
              </label>
            ))}
          </fieldset>

          {/* Details (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="report-details" className="block text-sm font-medium text-ink-muted">
              Additional details{' '}
              <span className="text-ink-subtle font-normal">(optional)</span>
            </label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more context if needed…"
              rows={3}
              maxLength={1000}
              className="textarea"
            />
            <p className="text-xs text-ink-subtle text-right">
              {details.length}/1000
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedReason}
              className="btn-danger flex-1"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Flag className="size-4" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
