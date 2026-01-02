'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Upload, X, Image as ImageIcon, Palette, Type, Layout } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
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
  const [bio, setBio] = useState('')
  const [bannerImage, setBannerImage] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profileTheme, setProfileTheme] = useState<{
    backgroundColor?: string
    backgroundGradient?: string
    cardStyle?: 'default' | 'minimal' | 'bordered'
    fontSize?: 'small' | 'medium' | 'large'
  }>({ cardStyle: 'default', fontSize: 'medium' })
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
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
        setBio(data.bio || '')
        setBannerImage(data.bannerImage || '')
        setProfileImage(data.image || '')
        try {
          const theme = data.profileTheme ? (typeof data.profileTheme === 'string' ? JSON.parse(data.profileTheme) : data.profileTheme) : {}
          // Ensure cardStyle has a default value if not set
          setProfileTheme({
            ...theme,
            cardStyle: theme.cardStyle || 'default',
            fontSize: theme.fontSize || 'medium',
          })
        } catch (e) {
          setProfileTheme({ cardStyle: 'default', fontSize: 'medium' })
        }
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

      // Update session with new name, badge, and image
      await update({
        ...session,
        user: {
          ...session?.user,
          name: name.trim() || null,
          badge: badge || null,
          image: profileImage || (session?.user as any)?.image || null,
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
          bio: bio.trim() || null,
          bannerImage: bannerImage || null,
          profileImage: profileImage || null,
          profileTheme: JSON.stringify(profileTheme),
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
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <User className="h-8 w-8 text-[var(--text-primary)]" />
              <h1 className="text-5xl font-semibold text-[var(--text-primary)] tracking-tight">Edit Profile</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-lg mb-10">
              Update your profile information
            </p>
          </div>

          <div className="max-w-2xl">
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Profile Information</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[var(--text-primary)]">Display Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your display name"
                      className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                    />
                    <p className="text-xs text-[var(--text-secondary)]">
                      This name will be displayed throughout the application
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[var(--text-primary)]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-muted)] cursor-not-allowed"
                    />
                    <p className="text-xs text-[var(--text-secondary)]">
                      Email cannot be changed. It's used for authentication.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)]">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      {profileImage || (session.user as any)?.image ? (
                        <div className="relative">
                          <img
                            src={profileImage || (session.user as any).image}
                            alt="Profile"
                            className="w-20 h-20 rounded-full border-2 border-[var(--border-hover)] object-cover"
                          />
                          {profileImage && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => setProfileImage('')}
                              className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#2a2d35] border-2 border-[var(--border-hover)] flex items-center justify-center">
                          <User className="h-8 w-8 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          id="profile-image-upload"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            
                            setUploadingProfileImage(true)
                            try {
                              const formData = new FormData()
                              formData.append('file', file)
                              
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData,
                              })
                              
                              if (res.ok) {
                                const data = await res.json()
                                setProfileImage(data.url)
                              } else {
                                const error = await res.json()
                                alert(error.error || 'Failed to upload image')
                              }
                            } catch (error) {
                              console.error('Error uploading profile image:', error)
                              alert('Failed to upload image')
                            } finally {
                              setUploadingProfileImage(false)
                            }
                          }}
                          disabled={uploadingProfileImage}
                        />
                        <label htmlFor="profile-image-upload" className="cursor-pointer inline-block">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingProfileImage}
                            className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
                            onClick={(e) => {
                              e.preventDefault()
                              document.getElementById('profile-image-upload')?.click()
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingProfileImage ? 'Uploading...' : profileImage ? 'Change Picture' : 'Upload Picture'}
                          </Button>
                        </label>
                        <p className="text-xs text-[var(--text-secondary)] mt-2">
                          Upload a profile picture (recommended: square, at least 200x200px)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-[var(--text-primary)]">Bio / About</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself and your collections..."
                      rows={4}
                      maxLength={500}
                      className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition resize-none"
                    />
                    <p className="text-xs text-[var(--text-secondary)]">
                      {bio.length}/500 characters. This will be displayed on your public profile.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[var(--text-primary)]">Profile Banner</Label>
                    {bannerImage ? (
                      <div className="relative">
                        <img
                          src={bannerImage}
                          alt="Banner"
                          className="w-full h-48 object-cover rounded-lg border border-[var(--border-hover)]"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setBannerImage('')}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-[var(--border-hover)] rounded-lg p-8 text-center hover:border-[var(--accent-color)] smooth-transition">
                        <ImageIcon className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                          Upload a banner image for your profile (recommended: 1200x300px)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          id="banner-upload"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            
                            setUploadingBanner(true)
                            try {
                              const formData = new FormData()
                              formData.append('file', file)
                              
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData,
                              })
                              
                              if (res.ok) {
                                const data = await res.json()
                                setBannerImage(data.url)
                              } else {
                                const error = await res.json()
                                alert(error.error || 'Failed to upload image')
                              }
                            } catch (error) {
                              console.error('Error uploading banner:', error)
                              alert('Failed to upload image')
                            } finally {
                              setUploadingBanner(false)
                            }
                          }}
                          disabled={uploadingBanner}
                        />
                        <label htmlFor="banner-upload" className="cursor-pointer inline-block">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingBanner}
                            className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
                            onClick={(e) => {
                              e.preventDefault()
                              document.getElementById('banner-upload')?.click()
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                          </Button>
                        </label>
                      </div>
                    )}
                    <p className="text-xs text-[var(--text-secondary)]">
                      This banner will be displayed at the top of your public profile.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-[var(--text-primary)]">Privacy Settings</Label>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
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
                        <Label className="text-[var(--text-primary)]">Badge</Label>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Choose a badge to display next to your name. Unlock more badges by earning achievements!
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchProfileStats}
                        className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
                      >
                        Refresh
                      </Button>
                    </div>
                    {loading ? (
                      <div className="text-center py-8 text-[var(--text-secondary)]">Loading badges...</div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {/* Basic Badges Section */}
                          <div>
                            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Basic Badges</h3>
                            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 p-4 bg-[#2a2d35] rounded-lg border border-[var(--border-hover)]">
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
                                          : 'border-[var(--border-hover)] hover:border-[#666] hover:bg-[#353842]'
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
                            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                              Achievement Badges ({availableBadges.filter(b => b.source === 'achievement').length})
                            </h3>
                            {availableBadges.filter(b => b.source === 'achievement').length > 0 ? (
                              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 p-4 bg-[#2a2d35] rounded-lg border border-[var(--border-hover)] max-h-64 overflow-y-auto">
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
                                            : 'border-[var(--border-hover)] hover:border-[#666] hover:bg-[#353842]'
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
                              <div className="text-sm text-[var(--text-secondary)] p-4 bg-[#2a2d35] rounded-lg border border-[var(--border-hover)]">
                                <p>Unlock achievements to get more badges! 🎯</p>
                                <p className="text-xs text-[var(--text-muted)] mt-2">
                                  Go to the Achievements page and click "Check for New Achievements" to unlock badges.
                                </p>
                                {unlockedAchievements.length > 0 && (
                                  <div className="mt-3 p-2 bg-[#1a1d24] rounded border border-[var(--border-hover)]">
                                    <p className="text-xs text-[#FFD60A] mb-1">
                                      Debug: You have {unlockedAchievements.length} unlocked achievement(s)
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                      Available badges: {availableBadges.length} total ({availableBadges.filter(b => b.source === 'basic').length} basic, {availableBadges.filter(b => b.source === 'achievement').length} achievement)
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">
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
                                  : 'border-[var(--border-hover)] text-[var(--text-secondary)] hover:border-[#666] hover:text-[var(--text-primary)]'
                                }
                              `}
                            >
                              Remove Badge
                            </button>
                          </div>
                        </div>
                        {badge && (
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
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
                          <div className="text-sm text-[var(--text-muted)] italic">No badge selected</div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Theme Customization Section */}
                  <div className="space-y-4 pt-6 border-t border-[var(--border-hover)]">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-5 w-5 text-[var(--accent-color)]" />
                      <Label className="text-[var(--text-primary)] text-lg">Profile Theme Customization</Label>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      Customize how your public profile appears to others
                    </p>

                    {/* Background Color/Gradient */}
                    <div className="space-y-3">
                      <Label className="text-[var(--text-primary)] flex items-center gap-2">
                        <Layout className="h-4 w-4" />
                        Background Style
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-[var(--text-secondary)]">Background Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={profileTheme.backgroundColor || '#0f1114'}
                              onChange={(e) => setProfileTheme({ ...profileTheme, backgroundColor: e.target.value, backgroundGradient: undefined })}
                              className="w-20 h-10 p-1 bg-[var(--bg-tertiary)] border-[var(--border-hover)] cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={profileTheme.backgroundColor || '#0f1114'}
                              onChange={(e) => setProfileTheme({ ...profileTheme, backgroundColor: e.target.value, backgroundGradient: undefined })}
                              placeholder="#0f1114"
                              className="flex-1 bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-[var(--text-secondary)]">Gradient (e.g., linear-gradient(135deg, #667eea 0%, #764ba2 100%))</Label>
                          <Input
                            type="text"
                            value={profileTheme.backgroundGradient || ''}
                            onChange={(e) => setProfileTheme({ ...profileTheme, backgroundGradient: e.target.value, backgroundColor: undefined })}
                            placeholder="linear-gradient(...)"
                            className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Choose either a solid color or a gradient. Gradient will override color if both are set.
                      </p>
                    </div>

                    {/* Card Style */}
                    <div className="space-y-3">
                      <Label className="text-[var(--text-primary)] flex items-center gap-2">
                        <Layout className="h-4 w-4" />
                        Card Style
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['default', 'minimal', 'bordered'] as const).map((style) => {
                          // Determine card className based on style
                          let cardClassName = 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                          if (style === 'minimal') {
                            cardClassName = 'bg-transparent border-none'
                          } else if (style === 'bordered') {
                            cardClassName = 'bg-[#1a1d24] border-2 border-[var(--accent-color)]'
                          }
                          
                          return (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setProfileTheme({ ...profileTheme, cardStyle: style })}
                              className={`
                                p-4 rounded-lg border-2 smooth-transition text-left
                                ${profileTheme.cardStyle === style
                                  ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/20'
                                  : 'border-[var(--border-hover)] hover:border-[#666] bg-[#2a2d35]'
                                }
                              `}
                            >
                              <div className="text-sm font-medium text-[var(--text-primary)] mb-2 capitalize">
                                {style}
                              </div>
                              {/* Preview Card */}
                              <div className={`${cardClassName} rounded-lg p-3 mb-2 shadow-sm`}>
                                <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">Collection Name</div>
                                <div className="text-xs text-[var(--text-secondary)]">5 items collected</div>
                              </div>
                              <div className="text-xs text-[var(--text-secondary)]">
                                {style === 'default' && 'Standard card with shadow'}
                                {style === 'minimal' && 'Clean, minimal design'}
                                {style === 'bordered' && 'Emphasized borders'}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-3">
                      <Label className="text-[var(--text-primary)] flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Font Size
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setProfileTheme({ ...profileTheme, fontSize: size })}
                            className={`
                              p-4 rounded-lg border-2 smooth-transition text-center
                              ${profileTheme.fontSize === size
                                ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/20'
                                : 'border-[var(--border-hover)] hover:border-[#666] bg-[#2a2d35]'
                              }
                            `}
                          >
                            <div className="text-sm font-medium text-[var(--text-primary)] capitalize">
                              {size}
                            </div>
                            <div className={`text-[var(--text-secondary)] mt-1 ${size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'}`}>
                              Sample Text
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setProfileTheme({})}
                        className="border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
                      >
                        Reset to Default
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[#2a2d35] smooth-transition"
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

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] mt-6">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Account Statistics</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Your account overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#2a2d35] rounded-lg">
                    <p className="text-sm text-[var(--text-secondary)] mb-1">Collections</p>
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">
                      {loading ? '...' : stats.collectionsCount}
                    </p>
                  </div>
                  <div className="p-4 bg-[#2a2d35] rounded-lg">
                    <p className="text-sm text-[var(--text-secondary)] mb-1">Total Items</p>
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">
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

