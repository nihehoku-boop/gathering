'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toaster'

interface MissingImageItem {
  id: string
  name: string
  number: number | null
}

interface MissingImagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  isCommunityCollection?: boolean
  onImagesFilled?: () => void
}

export default function MissingImagesDialog({
  open,
  onOpenChange,
  collectionId,
  isCommunityCollection = false,
  onImagesFilled,
}: MissingImagesDialogProps) {
  const [missingImages, setMissingImages] = useState<MissingImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filling, setFilling] = useState(false)
  const [fillProgress, setFillProgress] = useState(0)
  const [fillResults, setFillResults] = useState<{
    filled: number
    failed: number
    details: Array<{ itemId: string; itemName: string; success: boolean; imageUrl?: string; error?: string }>
  } | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const toast = useToast()

  useEffect(() => {
    if (open && collectionId) {
      fetchMissingImages()
    }
  }, [open, collectionId])

  const fetchMissingImages = async () => {
    setLoading(true)
    try {
      const endpoint = isCommunityCollection
        ? `/api/community-collections/${collectionId}/missing-images`
        : `/api/collections/${collectionId}/missing-images`
      const res = await fetch(endpoint)
      if (res.ok) {
        const data = await res.json()
        setMissingImages(data.missingImages || [])
        setSelectedItems(new Set(data.missingImages?.map((item: MissingImageItem) => item.id) || []))
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch missing images' }))
        toast.error(errorData.error || 'Failed to fetch missing images')
      }
    } catch (error) {
      console.error('Error fetching missing images:', error)
      toast.error('An error occurred while fetching missing images')
    } finally {
      setLoading(false)
    }
  }

  const handleFillImages = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item')
      return
    }

    setFilling(true)
    setFillProgress(0)
    setFillResults(null)

    try {
      const endpoint = isCommunityCollection
        ? `/api/community-collections/${collectionId}/fill-images`
        : `/api/collections/${collectionId}/fill-images`
      const itemIdsArray = Array.from(selectedItems)
      if (itemIdsArray.length === 0) {
        toast.error('Please select at least one item')
        return
      }

      const requestBody = {
        itemIds: itemIdsArray,
        autoFill: true,
      }
      
      console.log('[MissingImagesDialog] Filling images:', {
        endpoint,
        collectionId,
        itemIdsCount: itemIdsArray.length,
        itemIds: itemIdsArray,
      })

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (res.ok) {
        const data = await res.json()
        setFillResults(data)
        setFillProgress(100)

        if (data.filled > 0) {
          toast.success(`Successfully filled ${data.filled} image${data.filled > 1 ? 's' : ''}`)
          // Refresh missing images list
          await fetchMissingImages()
          // Notify parent component
          if (onImagesFilled) {
            onImagesFilled()
          }
        }

        if (data.failed > 0) {
          toast.error(`Failed to fill ${data.failed} image${data.failed > 1 ? 's' : ''}`)
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}: ${res.statusText}` }))
        console.error('Fill images error:', res.status, errorData)
        
        if (res.status === 401) {
          toast.error('Unauthorized - Please sign in again')
        } else if (res.status === 403) {
          toast.error('Forbidden - Admin access required')
        } else if (res.status === 400) {
          toast.error(errorData.error || 'Invalid request - Please try again')
        } else {
          toast.error(errorData.error || `Failed to fill images (${res.status})`)
        }
      }
    } catch (error) {
      console.error('Error filling images:', error)
      toast.error('An error occurred while filling images')
    } finally {
      setFilling(false)
    }
  }

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    setSelectedItems(new Set(missingImages.map(item => item.id)))
  }

  const deselectAll = () => {
    setSelectedItems(new Set())
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => onOpenChange(false)}>
      <Card 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] border-[var(--border-color)]"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Missing Images
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Items without images in this collection
          </CardDescription>
        </CardHeader>
        <CardContent>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
          </div>
        ) : missingImages.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-[var(--text-primary)] text-lg font-medium">All items have images!</p>
            <p className="text-[var(--text-secondary)] text-sm mt-2">No missing images found in this collection.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--text-secondary)]">
                {selectedItems.size} of {missingImages.length} items selected
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  className="text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                >
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="border border-[var(--border-color)] rounded-lg max-h-96 overflow-y-auto">
              <div className="divide-y divide-[var(--border-color)]">
                {missingImages.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 flex items-center gap-3 hover:bg-[var(--bg-tertiary)] cursor-pointer ${
                      selectedItems.has(item.id) ? 'bg-[var(--bg-tertiary)]' : ''
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 text-[var(--accent-color)] border-[var(--border-color)] rounded focus:ring-[var(--accent-color)]"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.number && (
                          <span className="text-xs text-[var(--text-secondary)] font-mono">
                            #{item.number}
                          </span>
                        )}
                        <span className="text-[var(--text-primary)] font-medium truncate">
                          {item.name}
                        </span>
                      </div>
                    </div>
                    <ImageIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                  </div>
                ))}
              </div>
            </div>

            {filling && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Filling images...</span>
                  <span className="text-[var(--text-primary)]">{fillProgress}%</span>
                </div>
                <Progress value={fillProgress} className="h-2" />
              </div>
            )}

            {fillResults && (
              <div className="border border-[var(--border-color)] rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{fillResults.filled} filled</span>
                  </div>
                  {fillResults.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-500">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">{fillResults.failed} failed</span>
                    </div>
                  )}
                </div>
                {fillResults.details.length > 0 && (
                  <div className="text-xs text-[var(--text-secondary)] max-h-32 overflow-y-auto">
                    {fillResults.details.map((detail) => (
                      <div key={detail.itemId} className="flex items-center gap-2 py-1">
                        {detail.success ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className="truncate">{detail.itemName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
              >
                Close
              </Button>
              <Button
                onClick={handleFillImages}
                disabled={selectedItems.size === 0 || filling}
                className="bg-[var(--accent-color)] text-white hover:opacity-90 disabled:opacity-50"
              >
                {filling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Filling...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Fill Selected Images ({selectedItems.size})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  )
}

