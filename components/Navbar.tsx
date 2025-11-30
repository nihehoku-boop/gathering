'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Star, Settings, Info, Trophy, Award, BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getBadgeEmoji } from '@/lib/badges'

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/user/check-admin')
        .then(res => res.json())
        .then(data => {
          setIsAdmin(data.isAdmin || false)
        })
        .catch(() => setIsAdmin(false))
    } else {
      setIsAdmin(false)
    }
  }, [session])

  return (
    <nav className="border-b border-[#2a2d35] glass sticky top-0 z-50 lg:ml-64 bg-[#1a1d24] animate-slide-in-right will-change-transform">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-6 flex-1">
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className={`text-sm smooth-transition flex items-center gap-1.5 ${
                  pathname === '/admin' 
                    ? 'text-[var(--accent-color)] font-medium' 
                    : 'text-[#969696] hover:text-[#fafafa]'
                }`}
              >
                <Star className="h-4 w-4" />
                Admin
              </button>
            )}
            {session && (
              <>
                <button
                  onClick={() => router.push('/achievements')}
                  className={`text-sm smooth-transition flex items-center gap-1.5 ${
                    pathname === '/achievements' 
                      ? 'text-[var(--accent-color)] font-medium' 
                      : 'text-[#969696] hover:text-[#fafafa]'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  Achievements
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className={`text-sm smooth-transition flex items-center gap-1.5 ${
                    pathname === '/leaderboard' 
                      ? 'text-[var(--accent-color)] font-medium' 
                      : 'text-[#969696] hover:text-[#fafafa]'
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </button>
                <button
                  onClick={() => router.push('/statistics')}
                  className={`text-sm smooth-transition flex items-center gap-1.5 ${
                    pathname === '/statistics' 
                      ? 'text-[var(--accent-color)] font-medium' 
                      : 'text-[#969696] hover:text-[#fafafa]'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Statistics
                </button>
                <button
                  onClick={() => router.push('/about')}
                  className={`text-sm smooth-transition flex items-center gap-1.5 ${
                    pathname === '/about' 
                      ? 'text-[var(--accent-color)] font-medium' 
                      : 'text-[#969696] hover:text-[#fafafa]'
                  }`}
                >
                  <Info className="h-4 w-4" />
                  About
                </button>
                <button
                  onClick={() => router.push('/settings')}
                  className={`text-sm smooth-transition flex items-center gap-1.5 ${
                    pathname === '/settings' 
                      ? 'text-[var(--accent-color)] font-medium' 
                      : 'text-[#969696] hover:text-[#fafafa]'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <>
                <button
                  onClick={() => router.push('/profile')}
                  className={`text-sm smooth-transition flex items-center gap-1.5 ${
                    pathname === '/profile' 
                      ? 'text-[var(--accent-color)] font-medium' 
                      : 'text-[#969696] hover:text-[#fafafa]'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="text-[#fafafa] flex items-center gap-1.5">
                    {session.user?.badge && (
                      <span className="text-base">{getBadgeEmoji(session.user.badge) || session.user.badge}</span>
                    )}
                    {session.user?.name || session.user?.email}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="text-[#969696] hover:text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

