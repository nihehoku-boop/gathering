'use client'

export default function ItemCardSkeleton() {
  return (
    <div className="bg-[#1a1d24] border-[#2a2d35] rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-[2/3] bg-[#2a2d35] relative">
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#2a2d35] rounded-full border-2 border-[#353842]"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-2 bg-[#1a1d24]">
        <div className="h-4 bg-[#2a2d35] rounded w-3/4"></div>
      </div>
    </div>
  )
}

