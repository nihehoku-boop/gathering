'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, X } from 'lucide-react'

interface ReportCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionName: string
  onReported?: () => void
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or Scam' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'other', label: 'Other' },
] as const

export default function ReportCollectionDialog({
  open,
  onOpenChange,
  collectionId,
  collectionName,
  onReported,
}: ReportCollectionDialogProps) {
  const [reason, setReason] = useState<string>('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!reason) {
      setError('Please select a reason for reporting')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/community-collections/${collectionId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          description: description.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(false)
          setReason('')
          setDescription('')
          if (onReported) {
            onReported()
          }
        }, 2000)
      } else {
        setError(data.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Error reporting collection:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-[var(--text-primary)]">Report Collection</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-[var(--text-secondary)]">
            Report "{collectionName}" for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <div className="text-green-500 mb-2">✓</div>
              <p className="text-[var(--text-primary)]">Report submitted successfully</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Our team will review this collection
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Reason for reporting *
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reportReason) => (
                    <label
                      key={reportReason.value}
                      className="flex items-center gap-2 p-3 rounded-lg border border-[var(--border-hover)] hover:bg-[var(--bg-tertiary)] cursor-pointer smooth-transition"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reportReason.value}
                        checked={reason === reportReason.value}
                        onChange={(e) => setReason(e.target.value)}
                        className="accent-[var(--accent-color)]"
                      />
                      <span className="text-sm text-[var(--text-primary)]">
                        {reportReason.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-[var(--text-primary)]">
                  Additional details (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide any additional information..."
                  maxLength={1000}
                  rows={4}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-hover)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none resize-none"
                />
                <p className="text-xs text-[var(--text-secondary)]">
                  {description.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="flex-1 border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !reason}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

