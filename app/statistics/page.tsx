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
        <div className="min-h-screen bg-[#0f1114] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[#969696]">Loading statistics...</div>
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
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-8 text-[#969696] hover:text-[#fafafa] hover:bg-[#2a2d35] smooth-transition rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Button>

          <div className="mb-10 animate-fade-up">
            <h1 className="text-5xl font-semibold text-[#fafafa] mb-3 tracking-tight">
              Statistics Dashboard
            </h1>
            <p className="text-[#969696] text-lg">
              Insights into your collection
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#969696]">Total Collections</CardTitle>
                <Package className="h-4 w-4 text-[#969696]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#fafafa]">{statistics.totalCollections}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up" style={{ animationDelay: '50ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#969696]">Total Items</CardTitle>
                <BarChart3 className="h-4 w-4 text-[#969696]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#fafafa]">{statistics.totalItems}</div>
                <p className="text-xs text-[#969696] mt-1">
                  {statistics.ownedItems} owned ({statistics.completionPercentage}%)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#969696]">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#969696]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#fafafa]">{statistics.completionPercentage}%</div>
                <Progress value={statistics.completionPercentage} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up" style={{ animationDelay: '150ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#969696]">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-[#969696]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#fafafa]">
                  {statistics.averageRating > 0 ? statistics.averageRating.toFixed(1) : 'N/A'}
                </div>
                <p className="text-xs text-[#969696] mt-1">
                  {statistics.ratedItemsCount} rated items
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Collections by Category */}
            <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Collections by Category</CardTitle>
                <CardDescription className="text-[#969696]">
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
                              <span className="text-[#fafafa]">{category}</span>
                              <span className="text-[#969696]">{count}</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-[#969696] text-sm">No categories yet</p>
                )}
              </CardContent>
            </Card>

            {/* Tags Distribution */}
            <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up" style={{ animationDelay: '250ms' }}>
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Tags Distribution</CardTitle>
                <CardDescription className="text-[#969696]">
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
                          className="bg-[#2a2d35] border border-[#353842] px-3 py-1 rounded-full text-sm"
                        >
                          <span className="text-[#fafafa]">{tag}</span>
                          <span className="text-[#969696] ml-2">({count})</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-[#969696] text-sm">No tags yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Collections Progress */}
          <Card className="bg-[#1a1d24] border-[#2a2d35] mb-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="text-[#fafafa]">Collection Progress</CardTitle>
              <CardDescription className="text-[#969696]">
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
                            className="text-[#fafafa] font-medium cursor-pointer hover:text-[var(--accent-color)] smooth-transition"
                            onClick={() => router.push(`/collections/${collection.id}`)}
                          >
                            {collection.name}
                          </span>
                          <span className="text-xs text-[#969696]">
                            ({collection.ownedItems}/{collection.totalItems})
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-[#fafafa]">
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
          <Card className="bg-[#1a1d24] border-[#2a2d35] mb-8 animate-fade-up" style={{ animationDelay: '350ms' }}>
            <CardHeader>
              <CardTitle className="text-[#fafafa]">Largest Collections</CardTitle>
              <CardDescription className="text-[#969696]">
                Collections with the most items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.collectionsByItemCount.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex justify-between items-center p-3 bg-[#2a2d35] rounded-lg border border-[#353842] hover:border-[var(--accent-color)] smooth-transition cursor-pointer"
                    onClick={() => router.push(`/collections/${collection.id}`)}
                  >
                    <div>
                      <div className="text-[#fafafa] font-medium">{collection.name}</div>
                      <div className="text-xs text-[#969696] mt-1">
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
            <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="text-[#fafafa]">Condition Distribution</CardTitle>
                <CardDescription className="text-[#969696]">
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
                            <span className="text-[#fafafa]">{wear}</span>
                            <span className="text-[#969696]">{count}</span>
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



