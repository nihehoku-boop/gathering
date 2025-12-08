'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, XCircle, Eye, EyeOff, Clock, Package } from 'lucide-react'
import { useAlert } from '@/hooks/useAlert'
import AlertDialog from './ui/alert-dialog'

interface ContentReport {
  id: string
  reason: string
  description: string | null
  status: string
  reviewedBy: string | null
  reviewedAt: string | null
  adminNotes: string | null
  createdAt: string
  communityCollection: {
    id: string
    name: string
    description: string | null
    coverImage: string | null
    userId: string
    isHidden: boolean
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
    items: Array<{
      id: string
      name: string
      number: number | null
      notes: string | null
      image: string | null
      customFields: string
    }>
  }
  reporter: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

const REPORT_REASONS: Record<string, { label: string; color: string }> = {
  spam: { label: 'Spam or Scam', color: 'bg-red-500' },
  inappropriate: { label: 'Inappropriate Content', color: 'bg-orange-500' },
  copyright: { label: 'Copyright Violation', color: 'bg-purple-500' },
  other: { label: 'Other', color: 'bg-gray-500' },
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  reviewed: 'bg-blue-500',
  resolved: 'bg-green-500',
  dismissed: 'bg-gray-500',
}

export default function ContentReportsViewer() {
  const [reports, setReports] = useState<ContentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { alertDialog, showAlert, showConfirm, closeAlert } = useAlert()

  useEffect(() => {
    fetchReports()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchReports, 30000)
    return () => clearInterval(interval)
  }, [statusFilter])

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/admin/reports?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportAction = async (reportId: string, action: 'dismiss' | 'hide' | 'resolve') => {
    const actionLabels: Record<string, string> = {
      dismiss: 'dismiss',
      hide: 'hide the collection',
      resolve: 'resolve',
    }

    const confirmed = await showConfirm({
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${actionLabels[action]} this report?${action === 'hide' ? ' This will hide the collection from the community.' : ''}`,
      type: action === 'hide' ? 'warning' : 'info',
      confirmText: action === 'hide' ? 'Hide Collection' : action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancel',
    })

    if (!confirmed) return

    setActionLoading(reportId)

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminNotes: adminNotes.trim() || undefined,
        }),
      })

      if (response.ok) {
        showAlert({
          title: 'Success',
          message: 'Report updated successfully',
          type: 'success',
        })
        setAdminNotes('')
        setSelectedReport(null)
        fetchReports()
      } else {
        const data = await response.json()
        showAlert({
          title: 'Error',
          message: data.error || 'Failed to update report',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error updating report:', error)
      showAlert({
        title: 'Error',
        message: 'An error occurred',
        type: 'error',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = STATUS_COLORS[status] || 'bg-gray-500'
    return (
      <Badge className={`${colors} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Content Reports</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Review and moderate reported community collections
          </p>
        </div>
        <div className="flex gap-2">
          {['pending', 'reviewed', 'resolved', 'dismissed', 'all'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? 'accent-button text-white'
                  : 'border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-[var(--border-hover)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No reports found
            </h3>
            <p className="text-[var(--text-secondary)]">
              {statusFilter === 'pending'
                ? 'No pending reports at the moment.'
                : `No ${statusFilter} reports found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="bg-[var(--bg-secondary)] border-[var(--border-color)]"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg text-[var(--text-primary)]">
                        {report.communityCollection.name}
                      </CardTitle>
                      {getStatusBadge(report.status)}
                      {report.communityCollection.isHidden && (
                        <Badge className="bg-red-500 text-white">
                          <EyeOff className="mr-1 h-3 w-3" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                      <span>
                        Reported by: <strong>{report.reporter.name || report.reporter.email}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Created by: <strong>{report.communityCollection.user.name || report.communityCollection.user.email}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                    className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Reason:</span>
                    <Badge className={`ml-2 ${REPORT_REASONS[report.reason]?.color || 'bg-gray-500'} text-white`}>
                      {REPORT_REASONS[report.reason]?.label || report.reason}
                    </Badge>
                  </div>
                  {report.description && (
                    <div>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Description:</span>
                      <p className="text-sm text-[var(--text-primary)] mt-1">{report.description}</p>
                    </div>
                  )}
                  {report.adminNotes && (
                    <div>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">Admin Notes:</span>
                      <p className="text-sm text-[var(--text-primary)] mt-1">{report.adminNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[var(--text-primary)]">Review Report</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedReport(null)
                    setAdminNotes('')
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Collection</h4>
                  <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg">
                    <p className="font-medium text-[var(--text-primary)]">
                      {selectedReport.communityCollection.name}
                    </p>
                    {selectedReport.communityCollection.description && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {selectedReport.communityCollection.description}
                      </p>
                    )}
                    {selectedReport.communityCollection.coverImage && (
                      <img
                        src={selectedReport.communityCollection.coverImage}
                        alt={selectedReport.communityCollection.name}
                        className="mt-2 w-full h-32 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Reporter</h4>
                  <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg">
                    <p className="text-sm text-[var(--text-primary)]">
                      {selectedReport.reporter.name || selectedReport.reporter.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Collection Items</h4>
                <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg">
                  {selectedReport.communityCollection.items && selectedReport.communityCollection.items.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-[var(--text-secondary)] mb-2">
                        {selectedReport.communityCollection.items.length} item{selectedReport.communityCollection.items.length !== 1 ? 's' : ''} in this collection:
                      </p>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {selectedReport.communityCollection.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-2 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)]"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {item.number !== null && (
                                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                                    #{item.number}
                                  </span>
                                )}
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                  {item.name}
                                </p>
                              </div>
                              {item.notes && (
                                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                                  {item.notes}
                                </p>
                              )}
                              {item.customFields && item.customFields !== '{}' && (
                                <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-75">
                                  Has custom fields
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                      <Package className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No items in this collection
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Report Details</h4>
                <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg space-y-2">
                  <div>
                    <span className="text-xs text-[var(--text-secondary)]">Reason:</span>
                    <Badge className={`ml-2 ${REPORT_REASONS[selectedReport.reason]?.color || 'bg-gray-500'} text-white`}>
                      {REPORT_REASONS[selectedReport.reason]?.label || selectedReport.reason}
                    </Badge>
                  </div>
                  {selectedReport.description && (
                    <div>
                      <span className="text-xs text-[var(--text-secondary)]">Description:</span>
                      <p className="text-sm text-[var(--text-primary)] mt-1">
                        {selectedReport.description}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-[var(--text-secondary)]">Reported:</span>
                    <p className="text-sm text-[var(--text-primary)]">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  maxLength={1000}
                  rows={3}
                  className="w-full mt-2 bg-[var(--bg-tertiary)] border border-[var(--border-hover)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                  disabled={actionLoading === selectedReport.id}
                  className="flex-1 border-gray-500 text-gray-500 hover:bg-gray-500/10"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReportAction(selectedReport.id, 'hide')}
                  disabled={actionLoading === selectedReport.id}
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Collection
                </Button>
                <Button
                  onClick={() => handleReportAction(selectedReport.id, 'resolve')}
                  disabled={actionLoading === selectedReport.id}
                  className="flex-1 accent-button text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Resolve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => !open && closeAlert()}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        confirmText={alertDialog.confirmText}
        cancelText={alertDialog.cancelText}
        showCancel={alertDialog.showCancel}
        onConfirm={alertDialog.onConfirm}
        onCancel={alertDialog.onCancel}
      />
    </div>
  )
}

