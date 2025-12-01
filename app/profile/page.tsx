'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { getAvailableBadges, getBadgeEmoji, isBadgeAvailable } from '@/lib/badges'
import { parseAchievements } from '@/lib/achievements'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [badge, setBadge] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ collectionsCount: 0, itemsCount: 0 })
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [availableBadges, setAvailableBadges] = useState<Array<{ emoji: string; name: string; id: string; source: 'basic' | 'achievement'; achievementId?: string }>>(() => {
    // Initialize with basic badges immediately
    const basicBadges = [
      { emoji: '🌟', name: 'Star', id: 'basic_star', source: 'basic' as const },
      { emoji: '⭐', name: 'Star 2', id: 'basic_star2', source: 'basic' as const },
      { emoji: '💫', name: 'Dizzy', id: 'basic_dizzy', source: 'basic' as const },
      { emoji: '✨', name: 'Sparkles', id: 'basic_sparkles', source: 'basic' as const },
      { emoji: '🎯', name: 'Target', id: 'basic_target', source: 'basic' as const },
    ]
    return basicBadges
  })

  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || '')
      fetchProfileStats()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchProfileStats = async () => {
    try {
      console.log('[Profile] Fetching profile stats and achievements...')
      
      const [profileRes, achievementsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/achievements'),
      ])

      if (profileRes.ok) {
        const data = await profileRes.json()
        setName(data.name || '')
        setIsPrivate(data.isPrivate || false)
        setBadge(data.badge || '')
        setStats({
          collectionsCount: data.collectionsCount || 0,
          itemsCount: data.itemsCount || 0,
        })
        console.log('[Profile] Profile data loaded:', { name: data.name, badge: data.badge })
      } else {
        console.error('[Profile] Failed to fetch profile:', profileRes.status)
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json()
        console.log('[Profile] Raw achievements response:', achievementsData)
        
        // Handle both array and JSON string formats
        let unlocked: string[] = []
        if (Array.isArray(achievementsData.achievements)) {
          // API already returns an array - use it directly
          unlocked = achievementsData.achievements
          console.log('[Profile] Achievements are already an array, using directly')
        } else if (typeof achievementsData.achievements === 'string') {
          // Parse JSON string
          unlocked = parseAchievements(achievementsData.achievements)
          console.log('[Profile] Parsed achievements from JSON string')
        } else {
          // Fallback: empty array
          unlocked = []
          console.warn('[Profile] Unknown achievements format:', typeof achievementsData.achievements)
        }
        
        console.log('[Profile] Final unlocked achievements:', unlocked)
        setUnlockedAchievements(unlocked)
        const badges = getAvailableBadges(unlocked)
        console.log('[Profile] Generated badges:', badges)
        console.log('[Profile] Achievement badges:', badges.filter(b => b.source === 'achievement'))
        setAvailableBadges(badges)
        console.log('[Profile] Achievement badges count:', badges.filter(b => b.source === 'achievement').length)
        console.log('[Profile] Current badge:', badge)
      } else {
        const errorData = await achievementsRes.json().catch(() => ({}))
        console.error('[Profile] Failed to fetch achievements:', achievementsRes.status, errorData)
      }
    } catch (error) {
      console.error('[Profile] Error fetching profile stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate badge is available
      if (badge && !isBadgeAvailable(badge, unlockedAchievements)) {
        alert('You cannot select a badge you haven\'t unlocked yet!')
        setSaving(false)
        return
      }

      // Update session with new name and badge
      await update({
        ...session,
        user: {
          ...session?.user,
          name: name.trim() || null,
          badge: badge || null,
        },
      })

      // Update in database
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim() || null,
          isPrivate,
          badge: badge || null,
        }),
      })

      if (res.ok) {
        const updatedData = await res.json()
        // Update badge in state
        setBadge(updatedData.badge || '')
        // Refresh stats and achievements to update available badges
        await fetchProfileStats()
        // Refresh session to update badge in navbar - force a full refresh
        window.location.reload()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to update profile'}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <User className="h-8 w-8 text-[#fafafa]" />
              <h1 className="text-5xl font-semibold text-[#fafafa] tracking-tight">Edit Profile</h1>
            </div>
            <p className="text-[#969696] text-lg mb-10">
              Update your profile information
            </p>
          </div>

          <div className="max-w-2xl">
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Profile Information</CardTitle>
                <CardDescription className="text-[#969696]">
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#fafafa]">Display Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your display name"
                      className="bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
                    />
                    <p className="text-xs text-[#969696]">
                      This name will be displayed throughout the application
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#fafafa]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-[#2a2d35] border-[#353842] text-[#666] cursor-not-allowed"
                    />
                    <p className="text-xs text-[#969696]">
                      Email cannot be changed. It's used for authentication.
                    </p>
                  </div>

                  {(session.user as any)?.image && (
                    <div className="space-y-2">
                      <Label className="text-[#fafafa]">Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <img
                          src={(session.user as any).image}
                          alt="Profile"
                          className="w-20 h-20 rounded-full border-2 border-[#353842]"
                        />
                        <p className="text-sm text-[#969696]">
                          Profile picture is managed by your authentication provider
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[#fafafa]">Privacy Settings</Label>
                        <p className="text-xs text-[#969696] mt-1">
                          Hide your profile from leaderboards and public profiles
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#2a2d35] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[#fafafa]">Badge</Label>
                        <p className="text-xs text-[#969696]">
                          Choose a badge to display next to your name. Unlock more badges by earning achievements!
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchProfileStats}
                        className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
                      >
                        Refresh
                      </Button>
                    </div>
                    {loading ? (
                      <div className="text-center py-8 text-[#969696]">Loading badges...</div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {/* Basic Badges Section */}
                          <div>
                            <h3 className="text-sm font-medium text-[#fafafa] mb-2">Basic Badges</h3>
                            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 p-4 bg-[#2a2d35] rounded-lg border border-[#353842]">
                              {availableBadges
                                .filter(b => b.source === 'basic')
                                .map((badgeOption) => {
                                  const isSelected = badge === badgeOption.id || badge === badgeOption.emoji
                                  return (
                                    <button
                                      key={badgeOption.id}
                                      type="button"
                                      onClick={() => setBadge(badgeOption.id)}
                                      className={`
                                        w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl
                                        transition-all smooth-transition
                                        ${isSelected
                                          ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/20 scale-110'
                                          : 'border-[#353842] hover:border-[#666] hover:bg-[#353842]'
                                        }
                                      `}
                                      title={badgeOption.name}
                                    >
                                      {badgeOption.emoji}
                                    </button>
                                  )
                                })}
                            </div>
                          </div>

                          {/* Achievement Badges Section */}
                          <div>
                            <h3 className="text-sm font-medium text-[#fafafa] mb-2">
                              Achievement Badges ({availableBadges.filter(b => b.source === 'achievement').length})
                            </h3>
                            {availableBadges.filter(b => b.source === 'achievement').length > 0 ? (
                              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 p-4 bg-[#2a2d35] rounded-lg border border-[#353842] max-h-64 overflow-y-auto">
                                {availableBadges
                                  .filter(b => b.source === 'achievement')
                                  .map((badgeOption) => {
                                    const isSelected = badge === badgeOption.id || badge === badgeOption.emoji
                                    return (
                                      <button
                                        key={badgeOption.id}
                                        type="button"
                                        onClick={() => {
                                          console.log('[Profile] Selecting achievement badge:', badgeOption.id, badgeOption.emoji, badgeOption.name)
                                          setBadge(badgeOption.id)
                                        }}
                                        className={`
                                          w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl
                                          transition-all smooth-transition relative
                                          ${isSelected
                                            ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/20 scale-110'
                                            : 'border-[#353842] hover:border-[#666] hover:bg-[#353842]'
                                          }
                                        `}
                                        title={`${badgeOption.name} (Achievement)`}
                                      >
                                        {badgeOption.emoji}
                                        {isSelected && (
                                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent-color)] rounded-full border-2 border-[#1a1d24]"></div>
                                        )}
                                      </button>
                                    )
                                  })}
                              </div>
                            ) : (
                              <div className="text-sm text-[#969696] p-4 bg-[#2a2d35] rounded-lg border border-[#353842]">
                                <p>Unlock achievements to get more badges! 🎯</p>
                                <p className="text-xs text-[#666] mt-2">
                                  Go to the Achievements page and click "Check for New Achievements" to unlock badges.
                                </p>
                                {unlockedAchievements.length > 0 && (
                                  <div className="mt-3 p-2 bg-[#1a1d24] rounded border border-[#353842]">
                                    <p className="text-xs text-[#FFD60A] mb-1">
                                      Debug: You have {unlockedAchievements.length} unlocked achievement(s)
                                    </p>
                                    <p className="text-xs text-[#969696]">
                                      Available badges: {availableBadges.length} total ({availableBadges.filter(b => b.source === 'basic').length} basic, {availableBadges.filter(b => b.source === 'achievement').length} achievement)
                                    </p>
                                    <p className="text-xs text-[#666] mt-1">
                                      Check browser console (F12) for detailed logs.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Option to remove badge */}
                          <div>
                            <button
                              type="button"
                              onClick={() => setBadge('')}
                              className={`
                                px-4 py-2 rounded-lg border-2 text-sm
                                transition-all smooth-transition
                                ${!badge
                                  ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/20 text-[var(--accent-color)]'
                                  : 'border-[#353842] text-[#969696] hover:border-[#666] hover:text-[#fafafa]'
                                }
                              `}
                            >
                              Remove Badge
                            </button>
                          </div>
                        </div>
                        {badge && (
                          <div className="flex items-center gap-2 text-sm text-[#969696]">
                            <span>Selected:</span>
                            <span className="text-xl">{getBadgeEmoji(badge) || badge}</span>
                            {badge.startsWith('achievement_') && (
                              <span className="text-xs">(Achievement Badge)</span>
                            )}
                            {badge.startsWith('basic_') && (
                              <span className="text-xs">(Basic Badge)</span>
                            )}
                          </div>
                        )}
                        {!badge && (
                          <div className="text-sm text-[#666] italic">No badge selected</div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving || loading}
                      className="accent-button text-white smooth-transition"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35] mt-6">
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Account Statistics</CardTitle>
                <CardDescription className="text-[#969696]">
                  Your account overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#2a2d35] rounded-lg">
                    <p className="text-sm text-[#969696] mb-1">Collections</p>
                    <p className="text-2xl font-semibold text-[#fafafa]">
                      {loading ? '...' : stats.collectionsCount}
                    </p>
                  </div>
                  <div className="p-4 bg-[#2a2d35] rounded-lg">
                    <p className="text-sm text-[#969696] mb-1">Total Items</p>
                    <p className="text-2xl font-semibold text-[#fafafa]">
                      {loading ? '...' : stats.itemsCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

