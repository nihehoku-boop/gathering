'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Settings, ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

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
  const [accentColor, setAccentColor] = useState('#FFD60A')
  const [showProgressInSidebar, setShowProgressInSidebar] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Load accent color from user profile
        const profileRes = await fetch('/api/user/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          const savedAccentColor = profileData.accentColor || '#FFD60A'
          setAccentColor(savedAccentColor)
          
          // Apply accent color
          document.documentElement.style.setProperty('--accent-color', savedAccentColor)
          document.documentElement.style.setProperty('--accent-color-hover', adjustBrightness(savedAccentColor, -20))
        }
        
        // Load sidebar progress setting from localStorage (still local)
        const savedShowProgress = localStorage.getItem('showProgressInSidebar') !== 'false'
        setShowProgressInSidebar(savedShowProgress)
      } catch (error) {
        console.error('Error fetching settings:', error)
        // Fallback to defaults
        setAccentColor('#FFD60A')
        document.documentElement.style.setProperty('--accent-color', '#FFD60A')
        document.documentElement.style.setProperty('--accent-color-hover', '#E6C009')
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
                onClick={() => router.push('/')}
                className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Settings className="h-8 w-8 text-[#fafafa]" />
              <h1 className="text-5xl font-semibold text-[#fafafa] tracking-tight">Settings</h1>
            </div>
            <p className="text-[#969696] text-lg mb-10">
              Customize your experience and preferences
            </p>
          </div>
          
          <div className="max-w-4xl">
            <div className="space-y-6">
          {/* Appearance Settings */}
          <Card className="bg-[#1a1d24] border-[#2a2d35]">
            <CardHeader>
              <CardTitle className="text-[#fafafa]">Appearance</CardTitle>
              <CardDescription className="text-[#969696]">
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Accent Color */}
              <div className="space-y-3">
                <Label className="text-[#fafafa]">Accent Color</Label>
                <p className="text-sm text-[#969696]">
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
                          ? 'border-[#fafafa] scale-110 ring-2 ring-[#fafafa] ring-offset-2 ring-offset-[#1a1d24]' 
                          : 'border-[#353842] hover:border-[#666] hover:scale-105'
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
                          <div className="w-2 h-2 rounded-full bg-[#1a1d24]"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#969696]">
                  <span>Selected:</span>
                  <span className="font-medium text-[#fafafa]">{accentColor}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Settings */}
          <Card className="bg-[#1a1d24] border-[#2a2d35]">
            <CardHeader>
              <CardTitle className="text-[#fafafa]">Sidebar</CardTitle>
              <CardDescription className="text-[#969696]">
                Configure sidebar display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#fafafa]">Show Overall Progress</Label>
                    <p className="text-sm text-[#969696]">
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
          <Card className="bg-[#1a1d24] border-[#2a2d35]">
            <CardHeader>
              <CardTitle className="text-[#fafafa]">Data</CardTitle>
              <CardDescription className="text-[#969696]">
                Manage your data and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-[#969696]">
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
                          body: JSON.stringify({ accentColor: '#FFD60A' }),
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
                  className="px-4 py-2 rounded-full bg-[#2a2d35] hover:bg-[#353842] text-[#fafafa] smooth-transition text-sm"
                >
                  Reset to Defaults
                </button>
              </div>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

