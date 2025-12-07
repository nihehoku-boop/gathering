'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Lock, ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { ACHIEVEMENTS, getRarityColor, parseAchievements, type Achievement } from '@/lib/achievements'

export default function AchievementsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchAchievements()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/user/achievements')
      if (res.ok) {
        const data = await res.json()
        setUnlockedAchievements(data.achievements || [])
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAchievements = async () => {
    try {
      const res = await fetch('/api/user/check-achievements', {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.newlyUnlockedAchievements && data.newlyUnlockedAchievements.length > 0) {
          alert(`🎉 You unlocked ${data.newlyUnlockedAchievements.length} new achievement${data.newlyUnlockedAchievements.length > 1 ? 's' : ''}!`)
          // Refresh achievements list
          await fetchAchievements()
        } else {
          alert('No new achievements unlocked.')
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
      alert('Error checking achievements')
    }
  }

  const isUnlocked = (achievementId: string) => {
    return unlockedAchievements.includes(achievementId)
  }

  const getAchievementsByCategory = () => {
    const categories: Record<string, Achievement[]> = {
      collection: [],
      items: [],
      progress: [],
      variety: [],
      social: [],
      special: [],
    }

    ACHIEVEMENTS.forEach(achievement => {
      categories[achievement.category].push(achievement)
    })

    return categories
  }

  const categories = getAchievementsByCategory()
  const totalUnlocked = unlockedAchievements.length
  const totalAchievements = ACHIEVEMENTS.length
  const completionPercentage = Math.round((totalUnlocked / totalAchievements) * 100)

  if (!session) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardContent className="py-12 sm:py-16 text-center">
              <Lock className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-[var(--text-muted)] mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2 sm:mb-3">
                Sign in required
              </h3>
              <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                Please sign in to view your achievements.
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--accent-color)]" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">Achievements</h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-10">
              <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)]">
                Track your collecting milestones and unlock badges
              </p>
              <Button
                onClick={checkAchievements}
                className="accent-button text-white smooth-transition"
                size="sm"
              >
                Check for New Achievements
              </Button>
            </div>
          </div>

          {/* Progress Summary */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
                    {totalUnlocked} / {totalAchievements}
                  </h2>
                  <p className="text-[var(--text-secondary)]">Achievements Unlocked</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--accent-color)]">
                    {completionPercentage}%
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">Complete</p>
                </div>
              </div>
              <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-color)] smooth-transition"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
              <CardContent className="py-16 text-center">
                <div className="text-[var(--text-secondary)]">Loading achievements...</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(categories).map(([category, achievements]) => (
                <Card key={category} className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
                  <CardHeader>
                    <CardTitle className="text-[var(--text-primary)] capitalize">
                      {category} Achievements
                    </CardTitle>
                    <CardDescription className="text-[var(--text-secondary)]">
                      {achievements.filter(a => isUnlocked(a.id)).length} / {achievements.length} unlocked
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement) => {
                        const unlocked = isUnlocked(achievement.id)
                        const rarityColor = getRarityColor(achievement.rarity)

                        return (
                          <div
                            key={achievement.id}
                            className={`p-4 rounded-lg border transition-all ${
                              unlocked
                                ? 'bg-[var(--bg-tertiary)] border-[var(--accent-color)]/50'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-hover)] opacity-60'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-3xl flex-shrink-0">
                                {unlocked ? achievement.badge : '🔒'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-semibold ${
                                    unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                                  }`}>
                                    {achievement.name}
                                  </h3>
                                  {unlocked && (
                                    <span
                                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                                      style={{
                                        backgroundColor: `${rarityColor}20`,
                                        color: rarityColor,
                                        border: `1px solid ${rarityColor}50`,
                                      }}
                                    >
                                      {achievement.rarity}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm ${
                                  unlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
                                }`}>
                                  {achievement.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

