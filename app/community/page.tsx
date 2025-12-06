'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import CommunityCollectionsList from '@/components/CommunityCollectionsList'

export default function CommunityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[var(--text-secondary)]">Loading...</div>
        </div>
      </>
    )
  }

  if (!session) {
    return null
  }

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
          <CommunityCollectionsList />
        </div>
      </div>
    </>
  )
}

