'use client'

export default function CollectionCardSkeleton() {
  return (
    <div className="bg-[#1a1d24] border-[#2a2d35] rounded-lg overflow-hidden animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="w-full h-48 bg-[#2a2d35]"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-6 bg-[#2a2d35] rounded w-3/4"></div>
        
        {/* Category/Description Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-[#2a2d35] rounded w-1/4"></div>
          <div className="h-4 bg-[#2a2d35] rounded w-full"></div>
          <div className="h-4 bg-[#2a2d35] rounded w-5/6"></div>
        </div>
        
        {/* Progress Bar Skeleton */}
        <div className="space-y-2">
          <div className="h-2 bg-[#2a2d35] rounded w-full"></div>
          <div className="flex justify-between text-xs">
            <div className="h-3 bg-[#2a2d35] rounded w-16"></div>
            <div className="h-3 bg-[#2a2d35] rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

