import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import RecommendedCollectionsList from '@/components/RecommendedCollectionsList'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

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
          <h1 className="text-5xl font-semibold text-[var(--text-primary)] mb-3 tracking-tight">
            Recommended Collections
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-10">
            Discover and add curated collections to your account
          </p>
          <RecommendedCollectionsList />
        </div>
      </div>
    </>
  )
}

