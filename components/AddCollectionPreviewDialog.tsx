'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Package, CheckCircle2 } from 'lucide-react'

interface AddCollectionPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  collectionType: 'recommended' | 'community'
  onConfirm: () => void
}

export default function AddCollectionPreviewDialog({
  open,
  onOpenChange,
  collectionId,
  collectionType,
  onConfirm,
}: AddCollectionPreviewDialogProps) {
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState<{
    name: string
    description: string | null
    category: string | null
    items: Array<{ name: string; number: number | null }>
    template: string | null
    _count?: { items: number }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && collectionId) {
      fetchCollectionDetails()
    }
  }, [open, collectionId])

  const fetchCollectionDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = collectionType === 'recommended'
        ? `/api/recommended-collections/${collectionId}`
        : `/api/community-collections/${collectionId}`
      
      const res = await fetch(endpoint)
      if (res.ok) {
        const data = await res.json()
        setCollection(data)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to load collection details')
      }
    } catch (error) {
      console.error('Error fetching collection details:', error)
      setError('Failed to load collection details')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-[var(--bg-secondary)] border-[var(--border-color)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">Add Collection to Account</CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Preview what will be added
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-400">{error}</p>
            </div>
          ) : collection ? (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold text-[var(--text-primary)]">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-[var(--text-secondary)]">{collection.description}</p>
                )}
                {collection.category && (
                  <p className="text-xs text-[var(--text-muted)]">Category: {collection.category}</p>
                )}
              </div>
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-md">
                <Package className="h-5 w-5 text-[var(--accent-color)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {collection._count?.items || collection.items.length} item{(collection._count?.items || collection.items.length) !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Will be added to your collections
                  </p>
                </div>
              </div>
              {collection.template && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Template: {collection.template}</span>
                </div>
              )}
            </>
          ) : null}
        </CardContent>
        <div className="flex justify-end gap-2 p-4 border-t border-[var(--border-color)]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            disabled={loading || !!error || !collection}
            className="accent-button text-white"
          >
            Add to My Collections
          </Button>
        </div>
      </Card>
    </div>
  )
}

