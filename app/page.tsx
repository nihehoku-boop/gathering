import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import CollectionsList from '@/components/CollectionsList'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import LandingPage from '@/components/LandingPage'
import LandingFAQSchema from '@/components/LandingFAQSchema'
import OnboardingTour from '@/components/OnboardingTour'
import { getBadgeEmoji } from '@/lib/badges'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Show landing page if not logged in, otherwise show collections
  if (!session) {
    return (
      <>
        <LandingFAQSchema />
        <LandingPage />
      </>
    )
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Image src="/icons/chest.svg" alt="" width={32} height={32} className="h-8 w-8 flex-shrink-0" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">
                My Collections
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base lg:text-lg flex flex-wrap items-center gap-1.5">
              <span>Welcome back,</span>
              <span className="flex items-center gap-1.5">
                {session.user?.badge && <span className="text-lg sm:text-xl flex-shrink-0">{getBadgeEmoji(session.user.badge) || session.user.badge}</span>}
                <span className="break-words">{session.user?.name || session.user?.email}</span>
              </span>
              <span>! Your trove awaits.</span>
            </p>
          </div>
          <CollectionsList />
        </div>
      </main>
      <OnboardingTour />
    </>
  )
}

