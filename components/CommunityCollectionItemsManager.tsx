'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Edit, Trash2, ArrowLeft, Grid3x3, List, Image as ImageIcon } from 'lucide-react'
import EditCommunityItemDialog from './EditCommunityItemDialog'
import MissingImagesDialog from './MissingImagesDialog'
import { useToast } from '@/components/Toaster'

interface CommunityItem {
  id: string
  name: string
  number: number | null
  notes: string | null
  image: string | null
  customFields?: string | Record<string, any>
}

interface CommunityCollection {
  id: string
  name: string
  description: string | null
  category: string | null
  template?: string | null
  customFieldDefinitions?: string | null
  coverImage: string | null
  coverImageAspectRatio?: string | null
  items: CommunityItem[]
  userId: string
}

interface CommunityCollectionItemsManagerProps {
  collectionId: string
  onBack: () => void
  onUpdate?: () => void
}

export default function CommunityCollectionItemsManager({
  collectionId,
  onBack,
  onUpdate,
}: CommunityCollectionItemsManagerProps) {
  const { data: session } = useSession()
  const [collection, setCollection] = useState<CommunityCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<CommunityItem | null>(null)
  const [viewMode, setViewMode] = useState<'cover' | 'list'>('cover')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showMissingImagesDialog, setShowMissingImagesDialog] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchCollection()
    checkAdminStatus()
  }, [collectionId])

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/user/check-admin')
      if (res.ok) {
        const data = await res.json()
        setIsAdmin(data.isAdmin || false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/community-collections/${collectionId}`)
      if (res.ok) {
        const data = await res.json()
        setCollection(data)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        toast.error(`Failed to load collection: ${errorData.error || 'Collection not found'}`)
      }
    } catch (error) {
      console.error('Error fetching collection:', error)
      toast.error('Error loading collection. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canEdit = () => {
    if (!collection || !session) return false
    return isAdmin || collection.userId === session.user?.id
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return

    try {
      const res = await fetch(`/api/community-items/${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Item deleted successfully!')
        fetchCollection()
        onUpdate?.()
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete item' }))
        toast.error(errorData.error || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item. Please try again.')
    }
  }

  const handleSaveItem = async (itemId: string, data: { name: string; number: number | null; notes: string | null; image: string | null; customFields?: Record<string, any> }) => {
    try {
      const res = await fetch(`/api/community-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to save item' }))
        throw new Error(errorData.error || 'Failed to save item')
      }

      toast.success('Item updated successfully!')
      fetchCollection()
      onUpdate?.()
    } catch (error) {
      console.error('Error saving item:', error)
      throw error
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Loading items...</div>
  }

  if (!collection) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--text-primary)] mb-4">Collection not found</div>
        <div className="text-sm text-[var(--text-secondary)] mb-4">Collection ID: {collectionId}</div>
        <Button
          onClick={onBack}
          className="accent-button text-white smooth-transition rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const canEditItems = canEdit()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{collection.name}</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {collection.items.length} item{collection.items.length !== 1 ? 's' : ''}
            {canEditItems && ' • You can edit items'}
          </p>
        </div>
      </div>

      <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-[var(--text-primary)]">Items</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                {canEditItems ? 'View and manage items in this community collection' : 'View items in this community collection'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMissingImagesDialog(true)}
                  className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  title="Find Missing Images (Admin Only)"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant={viewMode === 'cover' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cover')}
                className={viewMode === 'cover' ? 'accent-button text-white' : 'border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}
              >
                <Grid3x3 className="mr-2 h-4 w-4" />
                Cover
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'accent-button text-white' : 'border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}
              >
                <List className="mr-2 h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {collection.items.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              No items yet.
            </div>
          ) : viewMode === 'cover' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {collection.items.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-lg border-2 overflow-hidden transition-all border-[#2a2d35] hover:border-[var(--border-hover)] bg-[#1a1d24]"
                >
                  <div 
                    className="bg-[var(--bg-tertiary)] relative"
                    style={{
                      aspectRatio: (collection as any).coverImageAspectRatio 
                        ? (collection as any).coverImageAspectRatio.replace(':', '/')
                        : '2/3',
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2d35] to-[#1a1d24]">
                        <div className="text-center p-2">
                          <div className="text-xs font-semibold text-[var(--text-secondary)]">
                            {item.number && `#${item.number}`}
                          </div>
                          <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    )}
                    {canEditItems && (
                      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingItem(item)
                          }}
                          className="w-6 h-6 rounded-full accent-button text-white flex items-center justify-center shadow-md hover:bg-[#0051D5] smooth-transition"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteItem(item.id)
                          }}
                          className="w-6 h-6 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-md hover:bg-[#D32F2F] smooth-transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-[#1a1d24]">
                    <div className="text-xs font-medium truncate text-[var(--text-primary)]">
                      {item.number && `#${item.number} `}
                      {item.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {collection.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)] smooth-transition"
                >
                  <div className="flex-1">
                    <div className="font-medium text-[var(--text-primary)]">
                      {item.number && `#${item.number} - `}
                      {item.name}
                    </div>
                    {item.notes && (
                      <div className="text-sm text-[var(--text-secondary)]">
                        {item.notes}
                      </div>
                    )}
                  </div>
                  {canEditItems && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingItem(item)}
                        className="text-[var(--accent-color)] hover:text-[var(--accent-color-hover)] hover:bg-[var(--bg-tertiary)] smooth-transition"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-[#FF3B30] hover:text-[#FF3B30] hover:bg-[var(--bg-tertiary)] smooth-transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <MissingImagesDialog
          open={showMissingImagesDialog}
          onOpenChange={setShowMissingImagesDialog}
          collectionId={collectionId}
          isCommunityCollection={true}
          onImagesFilled={() => {
            fetchCollection()
            onUpdate?.()
          }}
        />
      )}
      <EditCommunityItemDialog
        open={editingItem !== null}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        collectionTemplate={collection?.template || null}
        customFieldDefinitions={collection?.customFieldDefinitions || null}
        onSave={handleSaveItem}
      />
    </div>
  )
}

