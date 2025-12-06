'use client'

export default function ItemCardSkeleton() {
  return (
    <div className="bg-[var(--bg-secondary)] border-[var(--border-color)] rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-[2/3] bg-[var(--bg-tertiary)] relative">
        <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--bg-tertiary)] rounded-full border-2 border-[var(--border-hover)]"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-2 bg-[#1a1d24]">
        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4"></div>
      </div>
    </div>
  )
}

