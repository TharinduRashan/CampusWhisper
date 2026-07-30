'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  /** Whether to close on backdrop click (default true) */
  closeOnBackdrop?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Sync open state with dialog element
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handler = () => onClose()
    dialog.addEventListener('close', handler)
    return () => dialog.removeEventListener('close', handler)
  }, [onClose])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed inset-0 z-50 m-auto p-0 rounded-2xl shadow-2xl',
        'bg-card border border-card-border w-full max-w-md',
        'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        'open:animate-scale-in',
        className
      )}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex flex-col max-h-[90dvh]">
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-card-border">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-ink">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-ink-muted mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="btn-ghost btn-sm p-1.5 rounded-lg shrink-0 -mt-1 -mr-1"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </dialog>
  )
}
