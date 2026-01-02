'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings, ArrowLeft, Moon, Sun, Trash2, AlertTriangle, BookOpen } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { hexToHsl } from '@/lib/color-utils'
import { useTheme } from '@/components/ThemeProvider'

const ACCENT_COLORS = [
  { name: 'Yellow', value: '#FFD60A', class: 'bg-[#FFD60A]' },
  { name: 'Blue', value: '#007AFF', class: 'bg-[#007AFF]' },
  { name: 'Green', value: '#34C759', class: 'bg-[#34C759]' },
  { name: 'Orange', value: '#FF9500', class: 'bg-[#FF9500]' },
  { name: 'Red', value: '#FF3B30', class: 'bg-[#FF3B30]' },
  { name: 'Purple', value: '#AF52DE', class: 'bg-[#AF52DE]' },
  { name: 'Pink', value: '#FF2D55', class: 'bg-[#FF2D55]' },
  { name: 'Teal', value: '#5AC8FA', class: 'bg-[#5AC8FA]' },
]

const adjustBrightness = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, Math.min(255, (num >> 16) + amt))
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt))
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [accentColor, setAccentColor] = useState('#34C759')
  const [showProgressInSidebar, setShowProgressInSidebar] = useState(true)
  const [enableGoldenAccents, setEnableGoldenAccents] = useState(true)
  const [spotlightCollectionId, setSpotlightCollectionId] = useState<string | null>(null) // null = disabled by default
  const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Load accent color and other settings from user profile
        const profileRes = await fetch('/api/user/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          const savedAccentColor = profileData.accentColor || '#34C759'
          setAccentColor(savedAccentColor)
          setEnableGoldenAccents(profileData.enableGoldenAccents !== false) // Default to true
          setSpotlightCollectionId(profileData.spotlightCollectionId || null)
          
          // Apply accent color
          document.documentElement.style.setProperty('--accent-color', savedAccentColor)
          document.documentElement.style.setProperty('--accent-color-hover', adjustBrightness(savedAccentColor, -20))
          
          // Also update ring color to match accent color (for focus states)
          const accentHsl = hexToHsl(savedAccentColor)
          document.documentElement.style.setProperty('--ring', accentHsl)
        }
        
        // Load sidebar progress setting from localStorage (still local)
        const savedShowProgress = localStorage.getItem('showProgressInSidebar') !== 'false'
        setShowProgressInSidebar(savedShowProgress)
        
        // Fetch collections for spotlight selector
        const collectionsRes = await fetch('/api/collections')
        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json()
          setCollections(collectionsData.map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        // Fallback to defaults
        setAccentColor('#34C759')
        setEnableGoldenAccents(true)
        document.documentElement.style.setProperty('--accent-color', '#34C759')
        document.documentElement.style.setProperty('--accent-color-hover', adjustBrightness('#34C759', -20))
        const defaultHsl = hexToHsl('#34C759')
        document.documentElement.style.setProperty('--ring', defaultHsl)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleAccentColorChange = async (color: string) => {
    setAccentColor(color)
    
    // Apply immediately for better UX
    const accentColorHover = adjustBrightness(color, -20)
    document.documentElement.style.setProperty('--accent-color', color)
    document.documentElement.style.setProperty('--accent-color-hover', accentColorHover)
    
    // Also update ring color to match accent color (for focus states)
    const accentHsl = hexToHsl(color)
    document.documentElement.style.setProperty('--ring', accentHsl)
    
    // Also update localStorage immediately
    localStorage.setItem('accentColor', color)
    
    try {
      // Save to user profile
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accentColor: color }),
      })
      
      if (res.ok) {
        // Update session to reflect the change
        await update({
          ...session,
          user: {
            ...session?.user,
            accentColor: color,
          },
        })
      } else {
        console.error('Failed to save accent color')
      }
    } catch (error) {
      console.error('Error saving accent color:', error)
    }
  }

  const handleShowProgressChange = (enabled: boolean) => {
    setShowProgressInSidebar(enabled)
    localStorage.setItem('showProgressInSidebar', enabled.toString())
  }

  const handleGoldenAccentsChange = async (enabled: boolean) => {
    setEnableGoldenAccents(enabled)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enableGoldenAccents: enabled }),
      })
      if (!res.ok) {
        console.error('Failed to save golden accents setting')
      }
    } catch (error) {
      console.error('Error saving golden accents setting:', error)
    }
  }

  const handleSpotlightChange = async (collectionId: string | null) => {
    const newValue = collectionId || null
    setSpotlightCollectionId(newValue)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotlightCollectionId: newValue }),
      })
      if (res.ok) {
        // Success - setting saved
        console.log('Spotlight collection saved:', newValue)
      } else {
        const error = await res.json()
        console.error('Failed to save spotlight collection:', error)
        // Revert on error
        const profileRes = await fetch('/api/user/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setSpotlightCollectionId(profileData.spotlightCollectionId || null)
        }
      }
    } catch (error) {
      console.error('Error saving spotlight collection:', error)
      // Revert on error
      const profileRes = await fetch('/api/user/profile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setSpotlightCollectionId(profileData.spotlightCollectionId || null)
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (!session?.user?.email) {
      setDeleteError('Unable to get user email')
      return
    }

    if (deleteEmail.toLowerCase() !== session.user.email.toLowerCase()) {
      setDeleteError('Email does not match')
      return
    }

    if (!deletePassword) {
      setDeleteError('Password is required')
      return
    }

    setDeleteLoading(true)
    setDeleteError('')

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmEmail: deleteEmail,
          password: deletePassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Sign out and redirect to home
        await signOut({ callbackUrl: '/' })
      } else {
        setDeleteError(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setDeleteError('An error occurred. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
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
                className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Settings className="h-8 w-8 text-[var(--text-primary)]" />
              <h1 className="text-5xl font-semibold text-[var(--text-primary)] tracking-tight">Settings</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-lg mb-10">
              Customize your experience and preferences
            </p>
          </div>
          
          <div className="max-w-4xl">
            <div className="space-y-6">
          {/* Appearance Settings */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Appearance</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Mode */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[var(--text-primary)]">Theme Mode</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Switch between dark and light mode
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme === 'light'}
                      onChange={toggleTheme}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#2a2d35] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                  </label>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#969696]">
                  {theme === 'dark' ? (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Light mode</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Accent Color */}
              <div className="space-y-3">
                <Label className="text-[var(--text-primary)]">Accent Color</Label>
                <p className="text-sm text-[var(--text-secondary)]">
                  Choose your preferred accent color for buttons and highlights
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleAccentColorChange(color.value)}
                      className={`
                        relative w-12 h-12 rounded-full border-2 transition-all smooth-transition
                        ${accentColor === color.value 
                          ? 'border-[var(--text-primary)] scale-110 ring-2 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--bg-secondary)]' 
                          : 'border-[var(--border-hover)] hover:border-[var(--text-secondary)] hover:scale-105'
                        }
                        ${color.class}
                      `}
                      style={{
                        backgroundColor: color.value,
                      }}
                      title={color.name}
                    >
                      {accentColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[var(--bg-secondary)]"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span>Selected:</span>
                  <span className="font-medium text-[var(--text-primary)]">{accentColor}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trove Display Settings */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Trove Display</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Customize how your collections are displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Golden Accents Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[var(--text-primary)]">Golden Accents</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Enable gold accents for completed collections (100% progress)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGoldenAccents}
                      onChange={(e) => handleGoldenAccentsChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#2a2d35] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                  </label>
                </div>
              </div>

              {/* Trove Spotlight */}
              <div className="space-y-3">
                <Label className="text-[var(--text-primary)]">Trove Spotlight</Label>
                <p className="text-sm text-[var(--text-secondary)]">
                  Feature a collection prominently on your home page
                </p>
                <select
                  value={spotlightCollectionId || ''}
                  onChange={(e) => handleSpotlightChange(e.target.value || null)}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-hover)] text-[var(--text-primary)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] smooth-transition"
                >
                  <option value="">None (auto-select most complete)</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--text-secondary)]">
                  {spotlightCollectionId 
                    ? 'Selected collection will be featured prominently'
                    : 'Most complete collection will be automatically featured'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Settings */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Onboarding</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Restart the introduction tour to learn about features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  if (session?.user?.id) {
                    // Clear onboarding completion
                    localStorage.removeItem(`onboarding_completed_${session.user.id}`)
                    // Clear all step markers
                    const steps = ['create-collection', 'browse-recommended', 'explore-community']
                    steps.forEach(step => {
                      localStorage.removeItem(`onboarding_step_${step}_${session.user.id}`)
                    })
                    // Dispatch event to restart onboarding
                    window.dispatchEvent(new CustomEvent('onboarding:restart'))
                    alert('Onboarding tour will restart on the next page. Please refresh the page or navigate to the home page.')
                  }
                }}
                variant="outline"
                className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Restart Introduction Tour
              </Button>
            </CardContent>
          </Card>

          {/* Sidebar Settings */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Sidebar</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Configure sidebar display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[var(--text-primary)]">Show Overall Progress</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Display the overall progress counter and bar in the sidebar
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showProgressInSidebar}
                      onChange={(e) => handleShowProgressChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#2a2d35] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--accent-color)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Settings */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Data</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Manage your data and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  Your accent color is synced across all your devices. Sidebar preferences are stored locally in your browser.
                </p>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to reset all settings to default?')) {
                      try {
                        // Reset accent color to default
                        await fetch('/api/user/profile', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ accentColor: '#34C759' }),
                        })
                        
                        // Reset sidebar progress setting
                        localStorage.removeItem('showProgressInSidebar')
                        
                        // Reload to apply changes
                        window.location.reload()
                      } catch (error) {
                        console.error('Error resetting settings:', error)
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] smooth-transition text-sm"
                >
                  Reset to Defaults
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Account
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-[var(--text-secondary)]">
                    <p className="font-medium text-red-500 mb-1">Warning: This action cannot be undone</p>
                    <p>Deleting your account will permanently remove:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                      <li>All your collections and items</li>
                      <li>Your profile and settings</li>
                      <li>Your community collections and votes</li>
                      <li>Your wishlists</li>
                      <li>All other associated data</li>
                    </ul>
                  </div>
                </div>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Account Dialog */}
          {showDeleteDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)]">
                <CardHeader>
                  <CardTitle className="text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Confirm Account Deletion
                  </CardTitle>
                  <CardDescription className="text-[var(--text-secondary)]">
                    This action cannot be undone. Please confirm your email and password to proceed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deleteError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                      {deleteError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="delete-email" className="text-[var(--text-primary)]">
                      Confirm Email
                    </Label>
                    <Input
                      id="delete-email"
                      type="email"
                      placeholder={session?.user?.email || 'your@email.com'}
                      value={deleteEmail}
                      onChange={(e) => setDeleteEmail(e.target.value)}
                      className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)]"
                    />
                    <p className="text-xs text-[var(--text-secondary)]">
                      Enter your email address to confirm
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delete-password" className="text-[var(--text-primary)]">
                      Password
                    </Label>
                    <Input
                      id="delete-password"
                      type="password"
                      placeholder="Enter your password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)]"
                    />
                    <p className="text-xs text-[var(--text-secondary)]">
                      Enter your password to confirm deletion
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || !deleteEmail || !deletePassword}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete Account'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeleteDialog(false)
                        setDeleteEmail('')
                        setDeletePassword('')
                        setDeleteError('')
                      }}
                      variant="outline"
                      disabled={deleteLoading}
                      className="flex-1 border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

