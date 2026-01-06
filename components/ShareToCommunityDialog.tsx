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
import { Loader2, Search, X, Users } from 'lucide-react'
import { useToast } from '@/components/Toaster'
import Image from 'next/image'

interface Collection {
  id: string
  name: string
  description: string | null
  category: string | null
  coverImage: string | null
  sharedToCommunityId: string | null
  _count: {
    items: number
  }
}

interface ShareToCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function ShareToCommunityDialog({
  open,
  onOpenChange,
  onSuccess,
}: ShareToCommunityDialogProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sharingCollectionId, setSharingCollectionId] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      fetchCollections()
    }
  }, [open])

  const fetchCollections = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/collections?t=' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setCollections(data || [])
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (collectionId: string) => {
    setSharingCollectionId(collectionId)
    try {
      const res = await fetch(`/api/collections/${collectionId}/share-to-community`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`"${data.name}" shared to community successfully!`)
        onSuccess()
        // Refresh collections to update sharedToCommunityId
        fetchCollections()
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('communityCollectionsUpdated'))
        window.dispatchEvent(new CustomEvent('collectionsUpdated'))
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to share collection')
      }
    } catch (error) {
      console.error('Error sharing collection:', error)
      toast.error('Failed to share collection')
    } finally {
      setSharingCollectionId(null)
    }
  }

  const filteredCollections = collections.filter(collection => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        collection.name.toLowerCase().includes(query) ||
        collection.description?.toLowerCase().includes(query) ||
        collection.category?.toLowerCase().includes(query)
      )
    }
    return true
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-[var(--bg-secondary)] border-[var(--border-color)] max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[var(--text-primary)]">Add Collection to Community</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Select one of your collections to share with the community
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
            ) : filteredCollections.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                {searchQuery ? 'No collections found' : 'No collections available'}
              </div>
            ) : (
              filteredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {collection.coverImage && (
                      <div className="w-16 h-16 rounded overflow-hidden bg-[var(--bg-tertiary)] flex-shrink-0">
                        <Image
                          src={collection.coverImage}
                          alt={collection.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[var(--text-primary)] font-medium truncate">{collection.name}</h3>
                        {collection.sharedToCommunityId && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded border border-green-500/30 flex items-center gap-1 flex-shrink-0">
                            <Users className="h-3 w-3" />
                            Shared
                          </span>
                        )}
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
                      <div className="text-xs text-[var(--text-secondary)] mb-2">
                        {collection._count.items} items
                      </div>
                      {!collection.sharedToCommunityId && (
                        <Button
                          onClick={() => handleShare(collection.id)}
                          disabled={sharingCollectionId === collection.id}
                          size="sm"
                          className="accent-button text-white smooth-transition"
                        >
                          {sharingCollectionId === collection.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sharing...
                            </>
                          ) : (
                            <>
                              <Users className="mr-2 h-4 w-4" />
                              Share to Community
                            </>
                          )}
                        </Button>
                      )}
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
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

