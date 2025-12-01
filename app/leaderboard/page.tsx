'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Medal, Award, ArrowLeft, Crown } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { getBadgeEmoji } from '@/lib/badges'

interface LeaderboardEntry {
  id: string
  name: string
  email: string
  image: string | null
  badge: string | null
  totalItems: number
  ownedItems: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard')
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-[#FFD700]" />
      case 2:
        return <Medal className="h-6 w-6 text-[#C0C0C0]" />
      case 3:
        return <Medal className="h-6 w-6 text-[#CD7F32]" />
      default:
        return <span className="text-lg font-semibold text-[#969696] w-6 text-center">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border-[#FFD700]'
      case 2:
        return 'bg-gradient-to-r from-[#C0C0C0]/20 to-[#E8E8E8]/20 border-[#C0C0C0]'
      case 3:
        return 'bg-gradient-to-r from-[#CD7F32]/20 to-[#D4A574]/20 border-[#CD7F32]'
      default:
        return 'bg-[#1a1d24] border-[#2a2d35]'
    }
  }

  const currentUserRank = leaderboard.findIndex(
    (entry) => entry.id === session?.user?.id
  ) + 1

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
              <Trophy className="h-8 w-8 text-[var(--accent-color)]" />
              <h1 className="text-5xl font-semibold text-[#fafafa] tracking-tight">Leaderboard</h1>
            </div>
            <p className="text-[#969696] text-lg mb-10">
              Top collectors ranked by total owned items
            </p>
          </div>

          {loading ? (
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardContent className="py-16 text-center">
                <div className="text-[#969696]">Loading leaderboard...</div>
              </CardContent>
            </Card>
          ) : leaderboard.length === 0 ? (
            <Card className="bg-[#1a1d24] border-[#2a2d35]">
              <CardContent className="py-16 text-center">
                <Trophy className="mx-auto h-16 w-16 text-[#353842] mb-6" />
                <h3 className="text-xl font-semibold text-[#fafafa] mb-3">
                  No rankings yet
                </h3>
                <p className="text-[#969696]">
                  Start collecting items to appear on the leaderboard!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-4xl space-y-4">
              {session && currentUserRank > 0 && (
                <Card className={`bg-[#1a1d24] border-2 ${getRankColor(currentUserRank)}`}>
                  <CardHeader>
                    <CardTitle className="text-[#fafafa] flex items-center gap-2">
                      <Award className="h-5 w-5 text-[var(--accent-color)]" />
                      Your Ranking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(currentUserRank)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#fafafa] text-lg">
                          {leaderboard[currentUserRank - 1].name}
                        </div>
                        <div className="text-sm text-[#969696]">
                          {leaderboard[currentUserRank - 1].ownedItems} / {leaderboard[currentUserRank - 1].totalItems} items owned
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[var(--accent-color)]">
                          #{currentUserRank}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-[#1a1d24] border-[#2a2d35]">
                <CardHeader>
                  <CardTitle className="text-[#fafafa]">Top Collectors</CardTitle>
                  <CardDescription className="text-[#969696]">
                    Ranked by total owned items across all collections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1
                      const isCurrentUser = entry.id === session?.user?.id
                      const progress = entry.totalItems > 0 
                        ? Math.round((entry.ownedItems / entry.totalItems) * 100) 
                        : 0

                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                            isCurrentUser
                              ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/50'
                              : getRankColor(rank)
                          }`}
                        >
                          <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                            {getRankIcon(rank)}
                          </div>
                          {entry.image ? (
                            <img
                              src={entry.image}
                              alt={entry.name}
                              className="w-10 h-10 rounded-full border-2 border-[#353842] flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#2a2d35] border-2 border-[#353842] flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-[#fafafa]">
                                {entry.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className={`font-semibold truncate flex items-center gap-1.5 ${
                                isCurrentUser ? 'text-[var(--accent-color)]' : 'text-[#fafafa]'
                              }`}>
                                {entry.badge && (
                                  <span className="text-base flex-shrink-0">{getBadgeEmoji(entry.badge) || entry.badge}</span>
                                )}
                                <button
                                  onClick={() => router.push(`/profile/${entry.id}`)}
                                  className="hover:underline"
                                >
                                  {entry.name}
                                </button>
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-[#969696]">(You)</span>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-[#969696]">
                              {entry.ownedItems} / {entry.totalItems} items owned
                            </div>
                            <div className="mt-1 w-full bg-[#2a2d35] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-[var(--accent-color)] smooth-transition"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl font-bold text-[#fafafa]">
                              {entry.ownedItems}
                            </div>
                            <div className="text-xs text-[#969696]">
                              items
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

