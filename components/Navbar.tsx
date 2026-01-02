'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, User, Star, Settings, Info, Trophy, Award, BarChart3, Menu, X, PanelLeft, CheckCircle2 } from 'lucide-react'
import TreasureChest from './icons/TreasureChest'
import { useEffect, useState, useRef } from 'react'
import { getBadgeEmoji } from '@/lib/badges'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import EmailVerificationBanner from './EmailVerificationBanner'

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
    <>
      <EmailVerificationBanner />
      <nav className="border-b border-[var(--border-color)] glass sticky top-0 z-50 lg:ml-64 bg-[var(--bg-secondary)] animate-slide-in-right will-change-transform" style={{ top: 'var(--banner-height, 0px)' }}>
        <div className="container mx-auto px-4 sm:px-6 py-6 min-h-[73px]">
          <div className="flex justify-between items-center gap-4">
          {/* Mobile: Sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] smooth-transition p-2 -ml-2"
            aria-label="Open sidebar"
          >
            <PanelLeft className="h-6 w-6" />
          </button>

          {/* Mobile: Logo in center */}
          <Link href="/" className="lg:hidden flex-1 flex items-center justify-center gap-2 hover:opacity-80 smooth-transition">
            <TreasureChest className="h-6 w-6 text-[var(--accent-color)]" />
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tighter">
              Colletro
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-[var(--accent-color)] text-black rounded">
              Beta
            </span>
          </Link>

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
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                    {session.user?.badge && (
                      <span className="text-base">{getBadgeEmoji(session.user.badge) || session.user.badge}</span>
                    )}
                    {session.user?.name || session.user?.email}
                    {(session.user as any)?.isVerified && (
                      <span title="Verified account">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      </span>
                    )}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
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
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] smooth-transition overflow-hidden"
                aria-label="Profile"
              >
                {(session.user as any)?.image ? (
                  <img 
                    src={(session.user as any).image} 
                    alt={session.user?.name || 'Profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-[var(--text-secondary)]" />
                )}
              </button>
              
              {/* Menu dropdown button */}
              <div className="relative">
                <button
                  ref={menuButtonRef}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] smooth-transition p-2"
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
                    className="fixed w-56 max-w-[calc(100vw-2rem)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 overflow-hidden"
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
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      )
                    })}
                    {/* Sign Out button in mobile menu */}
                    <div className="border-t border-[var(--border-color)]">
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/auth/signin' })
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full px-4 py-3 text-left text-sm smooth-transition flex items-center gap-2 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
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
    </>
  )
}

