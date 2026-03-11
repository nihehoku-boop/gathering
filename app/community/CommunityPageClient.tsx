'use client'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import CommunityCollectionsList from '@/components/CommunityCollectionsList'

export type InitialCommunityData = {
  collections: Array<{
    id: string
    name: string
    description: string | null
    category: string | null
    coverImage: string | null
    coverImageFit?: string | null
    tags: string
    items: Array<{ id: string; name: string; number: number | null }>
    _count?: { items: number; votes?: number }
    userId: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
      badge: string | null
      isVerified: boolean
    }
    createdAt: string
    upvotes?: number
    score?: number
    userVote?: 'upvote' | null
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export default function CommunityPageClient({
  initialData,
}: {
  initialData: InitialCommunityData | null
}) {
  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-5xl font-semibold text-[var(--text-primary)] mb-3 tracking-tight animate-fade-up">
            Community Collections
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-10 animate-fade-up" style={{ animationDelay: '50ms' }}>
            Browse and share collections created by the community
          </p>
          <CommunityCollectionsList initialData={initialData} />
        </div>
      </div>
    </>
  )
}
