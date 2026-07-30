'use client'

import { useCallback, useRef, useState } from 'react'
import { ImageIcon, X, Upload, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { UPLOAD_CONFIG } from '@/lib/constants'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  postId?: string
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  postId,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value ?? null)

  const validate = (file: File): string | null => {
    if (!UPLOAD_CONFIG.acceptedTypes.includes(file.type)) {
      return 'Only JPG, PNG, GIF, and WebP images are allowed.'
    }
    if (file.size > UPLOAD_CONFIG.maxSizeBytes) {
      return `Image must be smaller than ${UPLOAD_CONFIG.maxSizeMB}MB.`
    }
    return null
  }

  const upload = useCallback(async (file: File) => {
    const err = validate(file)
    if (err) { setError(err); return }

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (postId) formData.append('postId', postId)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? 'Upload failed')

      onChange(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
      setPreview(null)
      onChange(null)
    } finally {
      setIsUploading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }, [onChange, postId])

  const handleFile = (file: File | undefined) => {
    if (file) upload(file)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {preview ? (
        /* Preview */
        <div className="relative rounded-xl overflow-hidden border border-card-border group">
          <div className="relative aspect-video w-full bg-card">
            <Image
              src={preview}
              alt="Upload preview"
              fill
              className="object-cover"
              unoptimized={preview.startsWith('blob:')}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Upload className="size-6 animate-bounce" />
                  <span className="text-sm font-medium">Uploading…</span>
                </div>
              </div>
            )}
          </div>
          {!isUploading && (
            <button
              type="button"
              onClick={() => { setPreview(null); onChange(null) }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Remove image"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFile(e.dataTransfer.files[0])
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-3',
            'border-2 border-dashed rounded-xl p-8 cursor-pointer',
            'transition-all duration-200',
            isDragging
              ? 'border-primary-500 bg-primary-600/10'
              : 'border-card-border hover:border-primary-600/50 hover:bg-card-hover'
          )}
        >
          <div className="flex items-center justify-center size-12 rounded-2xl bg-card">
            <ImageIcon className="size-5 text-ink-subtle" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-ink">
              Drop an image or{' '}
              <span className="text-primary-400">browse</span>
            </p>
            <p className="text-xs text-ink-subtle mt-1">
              JPG, PNG, GIF, WebP up to {UPLOAD_CONFIG.maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_CONFIG.acceptedTypes.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
