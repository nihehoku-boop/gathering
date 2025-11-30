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
        <div className="min-h-screen bg-[#0f1114] lg:ml-64">
          <div className="container mx-auto px-6 py-12">
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardContent className="py-16 text-center">
                <Lock className="mx-auto h-16 w-16 text-[#353842] mb-6" />
                <h3 className="text-xl font-semibold text-[#fafafa] mb-3">
                  Sign in required
                </h3>
                <p className="text-[#969696]">
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
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
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
              <Trophy className="h-8 w-8 text-[var(--accent-color)]" />
              <h1 className="text-5xl font-semibold text-[#fafafa] tracking-tight">Achievements</h1>
            </div>
            <div className="flex items-center justify-between mb-10">
              <p className="text-[#969696] text-lg">
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
          <Card className="bg-[#1a1d24] border-[#2a2d35] mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[#fafafa] mb-1">
                    {totalUnlocked} / {totalAchievements}
                  </h2>
                  <p className="text-[#969696]">Achievements Unlocked</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--accent-color)]">
                    {completionPercentage}%
                  </div>
                  <p className="text-sm text-[#969696]">Complete</p>
                </div>
              </div>
              <div className="w-full bg-[#2a2d35] rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-color)] smooth-transition"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardContent className="py-16 text-center">
                <div className="text-[#969696]">Loading achievements...</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(categories).map(([category, achievements]) => (
                <Card key={category} className="bg-[#1a1d24] border-[#2a2d35]">
                  <CardHeader>
                    <CardTitle className="text-[#fafafa] capitalize">
                      {category} Achievements
                    </CardTitle>
                    <CardDescription className="text-[#969696]">
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
                                ? 'bg-[#2a2d35] border-[var(--accent-color)]/50'
                                : 'bg-[#1a1d24] border-[#353842] opacity-60'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-3xl flex-shrink-0">
                                {unlocked ? achievement.badge : '🔒'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-semibold ${
                                    unlocked ? 'text-[#fafafa]' : 'text-[#666]'
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
                                  unlocked ? 'text-[#969696]' : 'text-[#666]'
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

