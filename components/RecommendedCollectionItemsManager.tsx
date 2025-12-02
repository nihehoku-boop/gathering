'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Edit, Trash2, ArrowLeft, Grid3x3, List, Plus, ImagePlus } from 'lucide-react'
import EditRecommendedItemDialog from './EditRecommendedItemDialog'
import CreateRecommendedItemDialog from './CreateRecommendedItemDialog'
import BulkImageUploadDialog from './BulkImageUploadDialog'

interface RecommendedItem {
  id: string
  name: string
  number: number | null
  notes: string | null
  image: string | null
}

interface RecommendedCollection {
  id: string
  name: string
  description: string | null
  category: string | null
  coverImage: string | null
  coverImageAspectRatio?: string | null
  items: RecommendedItem[]
}

interface RecommendedCollectionItemsManagerProps {
  collectionId: string
  onBack: () => void
  onUpdate: () => void
}

export default function RecommendedCollectionItemsManager({
  collectionId,
  onBack,
  onUpdate,
}: RecommendedCollectionItemsManagerProps) {
  const [collection, setCollection] = useState<RecommendedCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<RecommendedItem | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showBulkImageUpload, setShowBulkImageUpload] = useState(false)
  const [viewMode, setViewMode] = useState<'cover' | 'list'>('cover')

  useEffect(() => {
    fetchCollection()
  }, [collectionId])

  const fetchCollection = async () => {
    try {
      console.log('[RecommendedCollectionItemsManager] Fetching collection:', collectionId)
      const res = await fetch(`/api/recommended-collections/${collectionId}`)
      if (res.ok) {
        const data = await res.json()
        console.log('[RecommendedCollectionItemsManager] Collection fetched:', data)
        setCollection(data)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[RecommendedCollectionItemsManager] Failed to fetch collection:', res.status, errorData)
        alert(`Failed to load collection: ${errorData.error || 'Collection not found'}`)
      }
    } catch (error) {
      console.error('[RecommendedCollectionItemsManager] Error fetching collection:', error)
      alert('Error loading collection. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return

    try {
      const res = await fetch(`/api/recommended-items/${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCollection()
        onUpdate()
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete item' }))
        alert(`Error: ${errorData.error || 'Failed to delete item'}`)
        console.error('Error deleting item:', errorData)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item. Please try again.')
    }
  }

  const handleSaveItem = async (itemId: string, data: { name: string; number: number | null; notes: string | null; image: string | null }) => {
    const res = await fetch(`/api/recommended-items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to save item')
    }

    fetchCollection()
    onUpdate()
  }

  if (loading) {
    return <div className="text-center py-8">Loading items...</div>
  }

  if (!collection) {
    return (
      <div className="text-center py-8">
        <div className="text-[#fafafa] mb-4">Collection not found</div>
        <div className="text-sm text-[#969696] mb-4">Collection ID: {collectionId}</div>
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

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-[#fafafa]">{collection.name}</h2>
          <p className="text-sm text-[#969696]">
            {collection.items.length} items
          </p>
        </div>
      </div>

      <Card className="bg-[#1a1d24] border-[#2a2d35]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-[#fafafa]">Items</CardTitle>
              <CardDescription className="text-[#969696]">
                Manage items in this recommended collection
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="accent-button text-white smooth-transition"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
              {collection.items.length > 0 && (
                <Button
                  onClick={() => setShowBulkImageUpload(true)}
                  variant="outline"
                  size="sm"
                  className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Bulk Upload Images
                </Button>
              )}
              <Button
                variant={viewMode === 'cover' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cover')}
                className={viewMode === 'cover' ? 'accent-button text-white' : 'border-[#353842] text-[#fafafa] hover:bg-[#2a2d35]'}
              >
                <Grid3x3 className="mr-2 h-4 w-4" />
                Cover
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'accent-button text-white' : 'border-[#353842] text-[#fafafa] hover:bg-[#2a2d35]'}
              >
                <List className="mr-2 h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {collection.items.length === 0 ? (
            <div className="text-center py-8 text-[#969696]">
              No items yet. Click "Add Item" to add items to this collection.
            </div>
          ) : viewMode === 'cover' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {collection.items.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-lg border-2 overflow-hidden transition-all border-[#2a2d35] hover:border-[#353842] bg-[#1a1d24]"
                >
                  <div 
                    className="bg-[#2a2d35] relative"
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
                          <div className="text-xs font-semibold text-[#969696]">
                            {item.number && `#${item.number}`}
                          </div>
                          <div className="text-xs text-[#666] mt-1 line-clamp-2">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    )}
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
                  </div>
                  <div className="p-2 bg-[#1a1d24]">
                    <div className="text-xs font-medium truncate text-[#fafafa]">
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
                  className="flex items-center gap-3 p-3 rounded-lg border bg-[#1a1d24] border-[#2a2d35] hover:border-[#353842] smooth-transition"
                >
                  <div className="flex-1">
                    <div className="font-medium text-[#fafafa]">
                      {item.number && `#${item.number} - `}
                      {item.name}
                    </div>
                    {item.notes && (
                      <div className="text-sm text-[#969696]">
                        {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingItem(item)}
                      className="text-[var(--accent-color)] hover:text-[var(--accent-color-hover)] hover:bg-[#2a2d35] smooth-transition"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-[#FF3B30] hover:text-[#FF3B30] hover:bg-[#2a2d35] smooth-transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditRecommendedItemDialog
        open={editingItem !== null}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSave={handleSaveItem}
      />
      <CreateRecommendedItemDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        collectionId={collectionId}
        onSuccess={() => {
          fetchCollection()
          onUpdate()
        }}
      />
      <BulkImageUploadDialog
        open={showBulkImageUpload}
        onOpenChange={setShowBulkImageUpload}
        collectionId={collectionId}
        items={collection.items.map(item => ({
          id: item.id,
          name: item.name,
          number: item.number,
        }))}
        onSuccess={() => {
          fetchCollection()
          onUpdate()
        }}
      />
    </div>
  )
}

