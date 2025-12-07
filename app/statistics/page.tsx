'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, TrendingUp, Package, CheckCircle, Star, Tag, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Statistics {
  totalCollections: number
  totalItems: number
  ownedItems: number
  completionPercentage: number
  collectionsByCategory: Record<string, number>
  itemsByCollection: Array<{
    id: string
    name: string
    totalItems: number
    ownedItems: number
    completionPercentage: number
  }>
  topItems: Array<{
    name: string
    number: number | null
    isOwned: boolean
  }>
  collectionsByItemCount: Array<{
    id: string
    name: string
    itemCount: number
    ownedCount: number
  }>
  tagsDistribution: Record<string, number>
  averageRating: number
  ratedItemsCount: number
  wearDistribution: Record<string, number>
  itemsWithWearCount: number
}

export default function StatisticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchStatistics()
    }
  }, [status, router])

  const fetchStatistics = async () => {
    try {
      const res = await fetch('/api/user/statistics')
      if (res.ok) {
        const data = await res.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[var(--text-secondary)]">Loading statistics...</div>
        </div>
      </>
    )
  }

  if (!session || !statistics) {
    return null
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--text-primary)]" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">Statistics Dashboard</h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] mb-6 sm:mb-10">
              Insights into your collection
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Total Collections</CardTitle>
                <Package className="h-4 w-4 text-[var(--text-secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{statistics.totalCollections}</div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up" style={{ animationDelay: '50ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Total Items</CardTitle>
                <BarChart3 className="h-4 w-4 text-[var(--text-secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{statistics.totalItems}</div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {statistics.ownedItems} owned ({statistics.completionPercentage}%)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-[var(--text-secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{statistics.completionPercentage}%</div>
                <Progress value={statistics.completionPercentage} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up" style={{ animationDelay: '150ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-[var(--text-secondary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {statistics.averageRating > 0 ? statistics.averageRating.toFixed(1) : 'N/A'}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {statistics.ratedItemsCount} rated items
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Collections by Category */}
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Collections by Category</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Distribution of your collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(statistics.collectionsByCategory).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(statistics.collectionsByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, count]) => {
                        const percentage = (count / statistics.totalCollections) * 100
                        return (
                          <div key={category}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-[var(--text-primary)]">{category}</span>
                              <span className="text-[var(--text-secondary)]">{count}</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] text-sm">No categories yet</p>
                )}
              </CardContent>
            </Card>

            {/* Tags Distribution */}
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up" style={{ animationDelay: '250ms' }}>
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Tags Distribution</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Most used tags across collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(statistics.tagsDistribution).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statistics.tagsDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 20)
                      .map(([tag, count]) => (
                        <div
                          key={tag}
                          className="bg-[var(--bg-tertiary)] border border-[var(--border-hover)] px-3 py-1 rounded-full text-sm"
                        >
                          <span className="text-[var(--text-primary)]">{tag}</span>
                          <span className="text-[var(--text-secondary)] ml-2">({count})</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] text-sm">No tags yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Collections Progress */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] mb-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Collection Progress</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Completion status for each collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.itemsByCollection
                  .sort((a, b) => b.completionPercentage - a.completionPercentage)
                  .map((collection) => (
                    <div key={collection.id}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[var(--text-primary)] font-medium cursor-pointer hover:text-[var(--accent-color)] smooth-transition"
                            onClick={() => router.push(`/collections/${collection.id}`)}
                          >
                            {collection.name}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            ({collection.ownedItems}/{collection.totalItems})
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {collection.completionPercentage}%
                        </span>
                      </div>
                      <Progress value={collection.completionPercentage} className="h-2" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Collections by Item Count */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] mb-8 animate-fade-up" style={{ animationDelay: '350ms' }}>
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Largest Collections</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Collections with the most items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.collectionsByItemCount.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-hover)] hover:border-[var(--accent-color)] smooth-transition cursor-pointer"
                    onClick={() => router.push(`/collections/${collection.id}`)}
                  >
                    <div>
                      <div className="text-[var(--text-primary)] font-medium">{collection.name}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {collection.ownedCount} owned of {collection.itemCount} items
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-[var(--accent-color)]">
                      {collection.itemCount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wear Distribution */}
          {statistics.itemsWithWearCount > 0 && (
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Condition Distribution</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Items by wear condition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statistics.wearDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([wear, count]) => {
                      const percentage = (count / statistics.itemsWithWearCount) * 100
                      return (
                        <div key={wear}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-[var(--text-primary)]">{wear}</span>
                            <span className="text-[var(--text-secondary)]">{count}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}



