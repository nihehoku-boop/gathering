'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Download, RefreshCw, Filter, BarChart3 } from 'lucide-react'

interface PrismaLogEntry {
  timestamp: string
  operation: string
  model: string
  duration: number
  query?: string
  params?: any
  userId?: string
  collectionId?: string
  itemId?: string
}

interface PrismaStats {
  totalOperations: number
  operationsByType: Record<string, number>
  operationsByModel: Record<string, number>
  averageDuration: number
  slowestOperations: PrismaLogEntry[]
  operationsByUser: Record<string, number>
}

export default function PrismaLogsViewer() {
  const [logs, setLogs] = useState<PrismaLogEntry[]>([])
  const [stats, setStats] = useState<PrismaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'logs' | 'stats'>('stats')
  const [filters, setFilters] = useState({
    operation: '',
    model: '',
    minDuration: '',
    limit: '100',
  })

  useEffect(() => {
    fetchLogs()
    fetchStats()
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchLogs()
      fetchStats()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.operation) params.append('operation', filters.operation)
      if (filters.model) params.append('model', filters.model)
      if (filters.minDuration) params.append('minDuration', filters.minDuration)
      params.append('limit', filters.limit)

      const res = await fetch(`/api/admin/prisma-logs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/prisma-logs?format=stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all Prisma logs?')) return

    try {
      const res = await fetch('/api/admin/prisma-logs', { method: 'DELETE' })
      if (res.ok) {
        setLogs([])
        fetchStats()
      }
    } catch (error) {
      console.error('Error clearing logs:', error)
    }
  }

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/prisma-logs/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: viewMode === 'stats' ? 'stats' : 'logs' }),
      })
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prisma-${viewMode}-${new Date().toISOString()}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
    if (ms < 1000) return `${ms.toFixed(2)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading && !stats) {
    return <div className="text-center py-8">Loading Prisma logs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Prisma Operation Logs</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Monitor database operations and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'stats' ? 'default' : 'outline'}
            onClick={() => setViewMode('stats')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistics
          </Button>
          <Button
            variant={viewMode === 'logs' ? 'default' : 'outline'}
            onClick={() => setViewMode('logs')}
          >
            <Filter className="mr-2 h-4 w-4" />
            Logs
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleClearLogs}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button variant="outline" onClick={() => { fetchLogs(); fetchStats(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {viewMode === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--accent-color)]">
                {stats.totalOperations.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--accent-color)]">
                {formatDuration(stats.averageDuration)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operations by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.operationsByType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operations by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.operationsByModel)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([model, count]) => (
                    <div key={model} className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{model}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'stats' && stats && stats.slowestOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Slowest Operations</CardTitle>
            <CardDescription>Top 10 slowest database operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">Operation</th>
                    <th className="text-left p-2">Model</th>
                    <th className="text-right p-2">Duration</th>
                    <th className="text-left p-2">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.slowestOperations.map((log, idx) => (
                    <tr key={idx} className="border-b border-[var(--border-color)]">
                      <td className="p-2 text-[var(--text-secondary)]">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-xs font-mono">
                          {log.operation}
                        </span>
                      </td>
                      <td className="p-2 text-[var(--text-secondary)]">{log.model}</td>
                      <td className="p-2 text-right font-semibold text-[var(--accent-color)]">
                        {formatDuration(log.duration)}
                      </td>
                      <td className="p-2 text-[var(--text-secondary)] text-xs">
                        {log.userId ? log.userId.substring(0, 8) + '...' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'logs' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                    Operation
                  </label>
                  <Input
                    placeholder="e.g., findMany"
                    value={filters.operation}
                    onChange={(e) => setFilters({ ...filters, operation: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                    Model
                  </label>
                  <Input
                    placeholder="e.g., Collection"
                    value={filters.model}
                    onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                    Min Duration (ms)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={filters.minDuration}
                    onChange={(e) => setFilters({ ...filters, minDuration: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 block">
                    Limit
                  </label>
                  <Input
                    type="number"
                    value={filters.limit}
                    onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                  />
                </div>
              </div>
              <Button onClick={fetchLogs} className="mt-4">
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Operations ({logs.length})</CardTitle>
              <CardDescription>Last {filters.limit} operations</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  No logs found. Operations will appear here as they occur.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left p-2">Timestamp</th>
                        <th className="text-left p-2">Operation</th>
                        <th className="text-left p-2">Model</th>
                        <th className="text-right p-2">Duration</th>
                        <th className="text-left p-2">User ID</th>
                        <th className="text-left p-2">Collection ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, idx) => (
                        <tr key={idx} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]">
                          <td className="p-2 text-[var(--text-secondary)] text-xs">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="p-2">
                            <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-xs font-mono">
                              {log.operation}
                            </span>
                          </td>
                          <td className="p-2 text-[var(--text-secondary)]">{log.model}</td>
                          <td className="p-2 text-right">
                            <span className={`font-semibold ${
                              log.duration > 1000 ? 'text-red-500' :
                              log.duration > 500 ? 'text-orange-500' :
                              log.duration > 100 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {formatDuration(log.duration)}
                            </span>
                          </td>
                          <td className="p-2 text-[var(--text-secondary)] text-xs">
                            {log.userId ? log.userId.substring(0, 8) + '...' : '-'}
                          </td>
                          <td className="p-2 text-[var(--text-secondary)] text-xs">
                            {log.collectionId ? log.collectionId.substring(0, 8) + '...' : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

