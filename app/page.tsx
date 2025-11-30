import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"'
import CollectionsList from '@/components/CollectionsList'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { getBadgeEmoji } from '@/lib/badges'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-10 animate-fade-up">
            <h1 className="text-5xl font-semibold text-[#fafafa] mb-3 tracking-tight">
              My Collections
            </h1>
            <p className="text-[#969696] text-lg flex items-center gap-2">
              Welcome back,{' '}
              <span className="flex items-center gap-1.5">
                {session.user?.badge && <span className="text-xl">{getBadgeEmoji(session.user.badge) || session.user.badge}</span>}
                {session.user?.name || session.user?.email}
              </span>
              ! Manage and track your collections.
            </p>
          </div>
          <CollectionsList />
        </div>
      </main>
    </>
  )
}

