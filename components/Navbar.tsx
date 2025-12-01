'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Star, Settings, Info, Trophy, Award, BarChart3, Menu, X, PanelLeft } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { getBadgeEmoji } from '@/lib/badges'
import { useMobileMenu } from '@/contexts/MobileMenuContext'

export default function Navbar() {
  const { toggleSidebar } = useMobileMenu()
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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

  const menuItems = session ? [
    ...(isAdmin ? [{ label: 'Admin', icon: Star, path: '/admin' }] : []),
    { label: 'Achievements', icon: Award, path: '/achievements' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Statistics', icon: BarChart3, path: '/statistics' },
    { label: 'About', icon: Info, path: '/about' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ] : []

  return (
    <nav className="border-b border-[#2a2d35] glass sticky top-0 z-50 lg:ml-64 bg-[#1a1d24] animate-slide-in-right will-change-transform">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center gap-4">
          {/* Mobile: Sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-[#969696] hover:text-[#fafafa] smooth-transition p-2 -ml-2"
            aria-label="Open sidebar"
          >
            <PanelLeft className="h-6 w-6" />
          </button>

          {/* Mobile: Logo in center */}
          <h1 className="lg:hidden text-xl font-semibold text-[#fafafa] tracking-tight flex-1 text-center">
            Gathering
          </h1>

          {/* Desktop: Menu items */}
          <div className="hidden lg:flex items-center gap-6 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`text-sm smooth-transition flex items-center gap-1.5 ${
                    pathname === item.path 
                      ? 'text-[var(--accent-color)] font-medium' 
                      : 'text-[#969696] hover:text-[#fafafa]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Desktop: Menu items */}
          <div className="hidden lg:flex items-center gap-4">
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

          {/* Mobile: Profile picture and menu dropdown */}
          {session && (
            <div className="lg:hidden flex items-center gap-2">
              {/* Profile picture/avatar */}
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2a2d35] hover:bg-[#353842] smooth-transition overflow-hidden"
                aria-label="Profile"
              >
                {(session.user as any)?.image ? (
                  <img 
                    src={(session.user as any).image} 
                    alt={session.user?.name || 'Profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-[#969696]" />
                )}
              </button>
              
              {/* Menu dropdown button */}
              <div className="relative">
                <button
                  ref={menuButtonRef}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-[#969696] hover:text-[#fafafa] smooth-transition p-2"
                  aria-label="Open menu"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              
              {/* Mobile dropdown menu */}
              {isMobileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <div 
                    className="fixed w-56 max-w-[calc(100vw-2rem)] bg-[#1a1d24] border border-[#2a2d35] rounded-lg shadow-lg z-50 overflow-hidden"
                    style={{
                      top: menuButtonRef.current ? `${menuButtonRef.current.getBoundingClientRect().bottom + 8}px` : '4rem',
                      right: '1rem',
                    }}
                  >
                    {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            router.push(item.path)
                            setIsMobileMenuOpen(false)
                          }}
                          className={`w-full px-4 py-3 text-left text-sm smooth-transition flex items-center gap-2 ${
                            pathname === item.path
                              ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]'
                              : 'text-[#fafafa] hover:bg-[#2a2d35]'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      )
                    })}
                    {/* Sign Out button in mobile menu */}
                    <div className="border-t border-[#2a2d35]">
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/auth/signin' })
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full px-4 py-3 text-left text-sm smooth-transition flex items-center gap-2 text-[#fafafa] hover:bg-[#2a2d35]"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

