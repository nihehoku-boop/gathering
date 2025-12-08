'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Users, FolderOpen, Package, Heart, TrendingUp, Calendar } from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    totalCollections: number
    totalItems: number
    totalCommunityCollections: number
    totalWishlists: number
    avgItemsPerCollection: number
  }
  categories: Array<{
    category: string
    count: number
  }>
  growth: {
    users: Array<{
      date: string
      count: number
    }>
    collections: Array<{
      date: string
      count: number
    }>
  }
  period: string
}

export default function AnalyticsViewer() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Loading analytics...</div>
  }

  if (!data) {
    return (
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
        <CardContent className="py-12 text-center">
          <p className="text-[var(--text-secondary)]">Failed to load analytics data</p>
        </CardContent>
      </Card>
    )
  }

  const { overview, categories, growth } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Analytics</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Overview of platform usage and growth
          </p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className={
                period === p
                  ? 'accent-button text-white'
                  : 'border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }
            >
              {p === 'all' ? 'All Time' : p.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {overview.totalUsers.toLocaleString()}
            </div>
            {period !== 'all' && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                +{overview.newUsers} new in {period}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Active Users
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {overview.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {period !== 'all' ? `Active in ${period}` : 'All time'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Collections
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {overview.totalCollections.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Avg {overview.avgItemsPerCollection.toFixed(1)} items/collection
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Total Items
              </CardTitle>
              <Package className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {overview.totalItems.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Across all collections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Community Collections
              </CardTitle>
              <Heart className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {overview.totalCommunityCollections.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Shared by users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Wishlists
              </CardTitle>
              <Heart className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {overview.totalWishlists.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              User wishlists
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Avg Items/Collection
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {overview.avgItemsPerCollection.toFixed(1)}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Average collection size
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      {categories.length > 0 && (
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">Top Collection Categories</CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              Most popular collection types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.slice(0, 10).map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[var(--text-secondary)] w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-[var(--text-primary)]">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-[var(--bg-tertiary)] rounded-full h-2">
                      <div
                        className="bg-[var(--accent-color)] h-2 rounded-full"
                        style={{
                          width: `${(cat.count / categories[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] w-12 text-right">
                      {cat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Charts (Simple) */}
      {(growth.users.length > 0 || growth.collections.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">User Growth</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                New users per day (last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {growth.users.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">{day.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Collection Growth</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                New collections per day (last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {growth.collections.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">{day.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

