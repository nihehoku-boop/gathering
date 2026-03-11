import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import RecommendedCollectionsList from '@/components/RecommendedCollectionsList'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Recommended Collections',
  description: 'Discover and add curated collections to your account. Books, comics, films, and more.',
}

export default async function RecommendedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <Image src="/icons/star.svg" alt="" width={32} height={32} className="h-8 w-8" />
            <h1 className="text-5xl font-semibold text-[var(--text-primary)] tracking-tight">
              Recommended Collections
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] text-lg mb-10">
            Discover and add curated collections to your account
          </p>
          <RecommendedCollectionsList />
        </div>
      </div>
    </>
  )
}

