'use client'

export default function CollectionCardSkeleton() {
  return (
    <div className="bg-[var(--bg-secondary)] border-[var(--border-color)] rounded-lg overflow-hidden animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="w-full h-48 bg-[var(--bg-tertiary)]"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-6 bg-[var(--bg-tertiary)] rounded w-3/4"></div>
        
        {/* Category/Description Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4"></div>
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-full"></div>
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-5/6"></div>
        </div>
        
        {/* Progress Bar Skeleton */}
        <div className="space-y-2">
          <div className="h-2 bg-[var(--bg-tertiary)] rounded w-full"></div>
          <div className="flex justify-between text-xs">
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-16"></div>
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

