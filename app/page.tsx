import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import CollectionsList from '@/components/CollectionsList'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import LandingPage from '@/components/LandingPage'
import { getBadgeEmoji } from '@/lib/badges'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Show landing page if not logged in, otherwise show collections
  if (!session) {
    return <LandingPage />
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-5xl font-semibold text-[#fafafa] mb-3 tracking-tight" style={{ contentVisibility: 'auto' }}>
              My Collections
            </h1>
            <p className="text-[#969696] text-lg flex flex-wrap items-center gap-1.5">
              <span>Welcome back,</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                {session.user?.badge && <span className="text-xl flex-shrink-0">{getBadgeEmoji(session.user.badge) || session.user.badge}</span>}
                <span className="whitespace-nowrap">{session.user?.name || session.user?.email}</span>
              </span>
              <span>! Manage and track your collections.</span>
            </p>
          </div>
          <CollectionsList />
        </div>
      </main>
    </>
  )
}

