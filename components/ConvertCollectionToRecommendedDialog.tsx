'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Search, X } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description: string | null
  category: string | null
  template: string | null
  coverImage: string | null
  coverImageFit: string | null
  tags: string
  user: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    items: number
  }
}

interface ConvertCollectionToRecommendedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function ConvertCollectionToRecommendedDialog({
  open,
  onOpenChange,
  onSuccess,
}: ConvertCollectionToRecommendedDialogProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [converting, setConverting] = useState<string | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchCollections()
    }
  }, [open, searchQuery])

  const fetchCollections = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }
      const res = await fetch(`/api/admin/collections?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setCollections(data.collections || [])
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async (collectionId: string) => {
    setConverting(collectionId)
    try {
      const res = await fetch(`/api/admin/collections/${collectionId}/convert-to-recommended`, {
        method: 'POST',
      })

      if (res.ok) {
        onSuccess()
        onOpenChange(false)
        setSelectedCollectionId(null)
        setSearchQuery('')
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to convert collection'}`)
      }
    } catch (error) {
      console.error('Error converting collection:', error)
      alert('Failed to convert collection')
    } finally {
      setConverting(null)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-[var(--bg-secondary)] border-[var(--border-color)] max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[var(--text-primary)]">Convert Collection to Recommended</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Select a user collection to convert into a recommended collection
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col">
          {/* Search */}
          <div className="relative mb-4 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <Input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-color)]"
            />
          </div>

          {/* Collections List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                No collections found
              </div>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`p-3 bg-[var(--bg-primary)] rounded-lg border transition-colors cursor-pointer ${
                    selectedCollectionId === collection.id
                      ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                      : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
                  }`}
                  onClick={() => setSelectedCollectionId(collection.id)}
                >
                  <div className="flex items-start gap-3">
                    {collection.coverImage && (
                      <img
                        src={collection.coverImage}
                        alt={collection.name}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[var(--text-primary)] font-medium truncate">{collection.name}</h3>
                        {collection.category && (
                          <span className="px-2 py-0.5 text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded">
                            {collection.category}
                          </span>
                        )}
                      </div>
                      {collection.description && (
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-2">
                          {collection.description}
                        </p>
                      )}
                      <div className="text-xs text-[var(--text-secondary)]">
                        {collection._count.items} items • By {collection.user.name || collection.user.email}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 flex-shrink-0 border-t border-[var(--border-color)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
          >
            Cancel
          </Button>
          <Button
            onClick={() => selectedCollectionId && handleConvert(selectedCollectionId)}
            disabled={!selectedCollectionId || converting !== null}
            className="accent-button text-white smooth-transition"
          >
            {converting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to Recommended'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

