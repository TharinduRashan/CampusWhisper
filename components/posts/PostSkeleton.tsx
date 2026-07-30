import { cn } from '@/lib/utils'

/** Skeleton shimmer post card — shown while feed is loading */
export default function PostSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3 animate-pulse">
          {/* Category + time */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded-full bg-card-hover" />
            <div className="h-4 w-16 rounded-full bg-card-hover" />
          </div>
          {/* Title */}
          <div className="space-y-2">
            <div className="h-5 rounded-lg bg-card-hover w-full" />
            <div className="h-5 rounded-lg bg-card-hover w-4/5" />
          </div>
          {/* Body preview */}
          <div className="space-y-1.5">
            <div className="h-4 rounded-md bg-card-hover w-full" />
            <div className="h-4 rounded-md bg-card-hover w-3/4" />
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="h-8 w-24 rounded-xl bg-card-hover" />
              <div className="h-8 w-20 rounded-xl bg-card-hover" />
            </div>
            <div className="h-8 w-16 rounded-xl bg-card-hover" />
          </div>
        </div>
      ))}
    </>
  )
}
