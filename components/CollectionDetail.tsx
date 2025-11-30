'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Check, X, Upload, Grid3x3, List, Edit, ChevronDown, ChevronUp, Info, Image as ImageIcon, Download, Share2, Trash2, Heart, Square, CheckSquare2, Copy, Link as LinkIcon } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BulkImportDialog from './BulkImportDialog'
import EditItemDialog from './EditItemDialog'
import EditCollectionDialog from './EditCollectionDialog'
import AlternativeCoversView from './AlternativeCoversView'
import AlertDialog from './ui/alert-dialog'
import { useAlert } from '@/hooks/useAlert'

interface Item {
  id: string
  name: string
  number: number | null
  isOwned: boolean
  notes: string | null
  image: string | null
  alternativeImages?: string
  wear: string | null
  personalRating: number | null
  logDate: string | null
  customFields?: string | Record<string, any>
}

interface Collection {
  id: string
  name: string
  description: string | null
  category: string | null
  template?: string | null
  customFieldDefinitions?: string | null
  coverImage?: string | null
  coverImageAspectRatio?: string | null
  tags?: string
  items: Item[]
}

// Helper function to get custom field definitions
const getCustomFieldDefinitions = (collection: Collection | null): any[] => {
  if (!collection?.customFieldDefinitions) return []
  try {
    const parsed = typeof collection.customFieldDefinitions === 'string'
      ? JSON.parse(collection.customFieldDefinitions)
      : collection.customFieldDefinitions
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Helper function to get custom fields from item
const getItemCustomFields = (item: Item): Record<string, any> => {
  if (!item.customFields) return {}
  try {
    return typeof item.customFields === 'string'
      ? JSON.parse(item.customFields)
      : item.customFields
  } catch {
    return {}
  }
}

export default function CollectionDetail({ collectionId }: { collectionId: string }) {
  const router = useRouter()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsPage, setItemsPage] = useState(1)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [totalItemsCount, setTotalItemsCount] = useState(0)
  const [newItemName, setNewItemName] = useState('')
  const [newItemNumber, setNewItemNumber] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [viewMode, setViewMode] = useState<'cover' | 'list'>('cover')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showEditCollection, setShowEditCollection] = useState(false)
  const [viewingAlternatives, setViewingAlternatives] = useState<Item | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const { alertDialog, showAlert, showConfirm, closeAlert } = useAlert()

  useEffect(() => {
    fetchCollection()
  }, [collectionId])

  useEffect(() => {
    if (collection) {
      // Load first page of items silently
      fetchItems(1)
    }
  }, [collection])

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/collections/${collectionId}`)
      if (res.ok) {
        const data = await res.json()
        setCollection(data)
        // Share settings are now included in the collection response
        setIsPublic(data.isPublic || false)
        setShareToken(data.shareToken || null)
        setTotalItemsCount(data._count?.items || 0)
      }
    } catch (error) {
      console.error('Error fetching collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async (page: number = 1, append: boolean = false) => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/items?page=${page}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        if (append) {
          setItems(prev => [...prev, ...data.items])
        } else {
          setItems(data.items)
        }
        setHasMoreItems(data.pagination.hasMore)
        setItemsPage(page)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  // Silent infinite scroll - loads items as user scrolls without visible indicators
  useEffect(() => {
    if (!hasMoreItems) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreItems) {
          // Load next page silently
          fetchItems(itemsPage + 1, true)
        }
      },
      {
        rootMargin: '300px', // Start loading 300px before reaching the bottom
      }
    )

    // Observe the last item in the list
    const lastItem = document.querySelector('[data-last-item]')
    if (lastItem) {
      observer.observe(lastItem)
    }

    return () => {
      if (lastItem) {
        observer.unobserve(lastItem)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMoreItems, itemsPage, items.length])

  const toggleItemOwned = async (itemId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOwned: !currentStatus }),
      })

      if (res.ok) {
        fetchCollection()
      }
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    setAddingItem(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          name: newItemName,
          number: newItemNumber ? parseInt(newItemNumber) : null,
        }),
      })

      if (res.ok) {
        const newItem = await res.json()
        setNewItemName('')
        setNewItemNumber('')
        setShowAddForm(false)
        // Add the new item to the list
        setItems(prev => [newItem, ...prev])
        setTotalItemsCount(prev => prev + 1)
        fetchCollection()
      }
    } catch (error) {
      console.error('Error adding item:', error)
    } finally {
      setAddingItem(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        // Remove item from the list
        setItems(prev => prev.filter(item => item.id !== itemId))
        setTotalItemsCount(prev => Math.max(0, prev - 1))
        showAlert({
          title: 'Success',
          message: 'Item deleted successfully.',
          type: 'success',
        })
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete item' }))
        showAlert({
          title: 'Error',
          message: errorData.error || 'Failed to delete item',
          type: 'error',
        })
        console.error('Error deleting item:', errorData)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to delete item. Please try again.',
        type: 'error',
      })
    }
  }

  const toggleSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      newSelection.add(itemId)
    }
    setSelectedItems(newSelection)
  }

  const selectAll = () => {
    if (collection) {
      setSelectedItems(new Set(items.map(item => item.id)))
    }
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    const confirmed = await showConfirm({
      title: 'Delete Items',
      message: `Are you sure you want to delete ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}?`,
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })

    if (!confirmed) return

    try {
      const res = await fetch('/api/items/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: Array.from(selectedItems) }),
      })

      if (res.ok) {
        fetchCollection()
        clearSelection()
        setIsSelectionMode(false)
        showAlert({
          title: 'Success',
          message: `${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} deleted successfully.`,
          type: 'success',
        })
      } else {
        const errorData = await res.json()
        showAlert({
          title: 'Error',
          message: errorData.error || 'Failed to delete items',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error deleting items:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to delete items. Please try again.',
        type: 'error',
      })
    }
  }

  const handleBulkMarkOwned = async (isOwned: boolean) => {
    if (selectedItems.size === 0) return

    try {
      const res = await fetch('/api/items/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: Array.from(selectedItems), updates: { isOwned } }),
      })

      if (res.ok) {
        fetchCollection()
        clearSelection()
        showAlert({
          title: 'Success',
          message: `${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} marked as ${isOwned ? 'owned' : 'not owned'}.`,
          type: 'success',
        })
      } else {
        const errorData = await res.json()
        showAlert({
          title: 'Error',
          message: errorData.error || 'Failed to update items',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error updating items:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to update items. Please try again.',
        type: 'error',
      })
    }
  }

  const handleBulkAddToWishlist = async () => {
    if (selectedItems.size === 0 || !collection) return

    try {
      const itemsToAdd = items
        .filter(item => selectedItems.has(item.id))
        .map(item => ({
          itemId: item.id,
          collectionId: collection.id,
          itemName: item.name,
          itemNumber: item.number,
          itemImage: item.image,
          collectionName: collection.name,
        }))

      const res = await fetch('/api/wishlist/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAdd }),
      })

      if (res.ok) {
        clearSelection()
        setIsSelectionMode(false)
        showAlert({
          title: 'Success',
          message: `${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} added to wishlist!`,
          type: 'success',
        })
      } else {
        const errorData = await res.json()
        showAlert({
          title: 'Error',
          message: errorData.error || 'Failed to add items to wishlist',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error adding items to wishlist:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to add items to wishlist. Please try again.',
        type: 'error',
      })
    }
  }

  const saveItem = async (itemId: string, data: { name: string; number: number | null; notes: string | null; image: string | null; alternativeImages?: string[]; wear: string | null; personalRating: number | null; logDate: string | null; customFields?: Record<string, any> }) => {
    try {
      const updateData: any = { ...data }
      if (data.alternativeImages !== undefined) {
        updateData.alternativeImages = data.alternativeImages
      }
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `Failed to save item: ${res.status}`)
      }

      const result = await res.json()
      // Update the item in the local state
      setItems(prev => prev.map(item => item.id === itemId ? result : item))
      return result
    } catch (error) {
      console.error('Error saving item:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[#0f1114] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[#969696]">Loading collection...</div>
        </div>
      </>
    )
  }

  if (!collection) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[#0f1114] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[#969696]">Collection not found</div>
        </div>
      </>
    )
  }

  const ownedCount = items.filter(item => item.isOwned).length
  const totalCount = totalItemsCount || items.length
  const progress = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[#0f1114] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-8 text-[#969696] hover:text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collections
        </Button>

        <Card className="mb-8 bg-[#1a1d24] border-[#2a2d35] animate-fade-up">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-4xl font-semibold text-[#fafafa] tracking-tight">{collection.name}</CardTitle>
                {collection.category && (
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded mt-2 inline-block">
                    {collection.category}
                  </span>
                )}
                {collection.description && (
                  <CardDescription className="mt-2">
                    {collection.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition rounded-full"
                    title="Export Collection"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {showExportMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowExportMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1d24] border border-[#2a2d35] rounded-lg shadow-lg z-20 overflow-hidden">
                        <button
                          onClick={() => {
                            window.open(`/api/collections/${collection.id}/export?format=json`, '_blank')
                            setShowExportMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-[#fafafa] hover:bg-[#2a2d35] smooth-transition flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export as JSON
                        </button>
                        <button
                          onClick={() => {
                            window.open(`/api/collections/${collection.id}/export?format=csv`, '_blank')
                            setShowExportMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-[#fafafa] hover:bg-[#2a2d35] smooth-transition flex items-center gap-2 border-t border-[#2a2d35]"
                        >
                          <Download className="h-4 w-4" />
                          Export as CSV
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (!collection) {
                      showAlert({
                        title: 'Error',
                        message: 'Collection not loaded yet. Please wait.',
                        type: 'error',
                      })
                      return
                    }
                    try {
                      console.log('Toggling share, current isPublic:', isPublic, 'collection.id:', collection.id)
                      const res = await fetch(`/api/collections/${collection.id}/share`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isPublic: !isPublic }),
                      })
                      
                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}))
                        throw new Error(errorData.error || `HTTP ${res.status}`)
                      }
                      
                      const data = await res.json()
                      console.log('Share response:', data)
                      setIsPublic(data.isPublic)
                      setShareToken(data.shareToken)
                      showAlert({
                        title: 'Success',
                        message: `Collection is now ${data.isPublic ? 'public' : 'private'}.`,
                        type: 'success',
                      })
                    } catch (error) {
                      console.error('Error toggling public status:', error)
                      showAlert({
                        title: 'Error',
                        message: error instanceof Error ? error.message : 'Failed to update collection visibility.',
                        type: 'error',
                      })
                    }
                  }}
                  className={`border-[#353842] smooth-transition rounded-full ${
                    isPublic
                      ? 'bg-[#34C759]/10 border-[#34C759] text-[#34C759]'
                      : 'text-[#fafafa] hover:bg-[#2a2d35]'
                  }`}
                  title={isPublic ? 'Make Private' : 'Make Public'}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {isPublic && shareToken && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const shareLink = `${window.location.origin}/collections/share/${shareToken}`
                      navigator.clipboard.writeText(shareLink)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                      showAlert({
                        title: 'Link Copied!',
                        message: 'The shareable link has been copied to your clipboard.',
                        type: 'success',
                      })
                    }}
                    className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition rounded-full"
                    title="Copy Share Link"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEditCollection(true)}
                  className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition rounded-full"
                  title="Edit Collection"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collection Progress</span>
                <span className="font-semibold text-lg">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {ownedCount} of {totalCount} items collected
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1d24] border-[#2a2d35] animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-[#fafafa]">Items</CardTitle>
                <CardDescription className="text-[#969696]">
                  Manage the items in your collection
                </CardDescription>
              </div>
              <div className="flex gap-2">
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
            <div className="flex flex-col gap-2 mb-4">
              {!showAddForm ? (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBulkImport(true)}
                    className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
                    size="sm"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Import
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="accent-button text-white smooth-transition"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              ) : (
                <form onSubmit={addItem} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Item name (e.g., Book #1)"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="flex-1 bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
                      autoFocus
                    />
                    <Input
                      type="number"
                      placeholder="Number"
                      value={newItemNumber}
                      onChange={(e) => setNewItemNumber(e.target.value)}
                      className="w-24 bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[#007AFF] smooth-transition"
                    />
                    <Button 
                      type="submit" 
                      disabled={addingItem || !newItemName.trim()}
                      className="accent-button text-white smooth-transition"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setNewItemName('')
                        setNewItemNumber('')
                      }}
                      className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {items.length === 0 && loading === false && (
              <div className="text-center py-12 text-[#969696]">
                No items yet. Add your first item above!
              </div>
            )}
            {items.length > 0 && viewMode === 'cover' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    data-last-item={index === items.length - 1 ? true : undefined}
                    className={`relative group rounded-lg border-2 overflow-hidden transition-all animate-fade-up cursor-pointer ${
                      item.isOwned
                        ? 'border-[#34C759] shadow-md'
                        : 'border-[#2a2d35] hover:border-[#353842]'
                    } ${isSelectionMode && selectedItems.has(item.id) ? 'ring-2 ring-[var(--accent-color)]' : ''}`}
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleSelection(item.id)
                      }
                    }}
                  >
                    {isSelectionMode && (
                      <div className="absolute top-2 left-2 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelection(item.id)
                          }}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedItems.has(item.id)
                              ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
                              : 'bg-[#1a1d24]/90 border-[#353842] hover:border-[var(--accent-color)]'
                          }`}
                        >
                          {selectedItems.has(item.id) && <Check className="h-4 w-4 text-white" />}
                        </button>
                      </div>
                    )}
                    <div 
                      className="bg-[#2a2d35] relative"
                      style={{
                        aspectRatio: collection.coverImageAspectRatio 
                          ? collection.coverImageAspectRatio.replace(':', '/')
                          : '2/3',
                      }}
                    >
                      {item.image ? (
                        <>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover"
                            loading="lazy"
                            unoptimized={item.image.startsWith('/ltbcover/') || item.image.includes('localhost')}
                          />
                          {(() => {
                            try {
                              const altImages = item.alternativeImages ? JSON.parse(item.alternativeImages) : []
                              if (altImages.length > 0) {
                                return (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setViewingAlternatives(item)
                                    }}
                                    className="absolute bottom-2 left-2 bg-[#1a1d24]/90 hover:bg-[#2a2d35] text-[#fafafa] text-xs px-2 py-1 rounded-full border border-[#353842] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity smooth-transition z-10"
                                    title={`${altImages.length} alternative cover${altImages.length !== 1 ? 's' : ''}`}
                                  >
                                    <ImageIcon className="h-3 w-3" />
                                    {altImages.length}
                                  </button>
                                )
                              }
                            } catch {
                              return null
                            }
                            return null
                          })()}
                        </>
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
                      {!isSelectionMode && (
                        <button
                          onClick={() => toggleItemOwned(item.id, item.isOwned)}
                          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-md ${
                            item.isOwned
                              ? 'bg-[#34C759] border-[#30D158] text-white'
                              : 'bg-[#1a1d24] border-[#353842] hover:border-[#34C759]'
                          }`}
                        >
                          {item.isOwned && <Check className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                    <div className="p-2 bg-[#1a1d24]">
                      <div className="text-xs font-medium truncate text-[#fafafa]">
                        {item.number && `#${item.number} `}
                        {item.name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const newExpanded = new Set(expandedItems)
                          if (newExpanded.has(item.id)) {
                            newExpanded.delete(item.id)
                          } else {
                            newExpanded.add(item.id)
                          }
                          setExpandedItems(newExpanded)
                        }}
                        className="mt-1 flex items-center gap-1 text-xs text-[#969696] hover:text-[var(--accent-color)] smooth-transition"
                      >
                        <Info className="h-3 w-3" />
                        <span>Info</span>
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                      {expandedItems.has(item.id) && (
                        <div className="mt-2 pt-2 border-t border-[#2a2d35] space-y-1 text-xs">
                          {item.wear && (
                            <div className="text-[#969696]">
                              <span className="font-medium text-[#fafafa]">Wear:</span> {item.wear}
                            </div>
                          )}
                          {item.personalRating && (
                            <div className="text-[#969696]">
                              <span className="font-medium text-[#fafafa]">Rating:</span> {item.personalRating}/10
                            </div>
                          )}
                          {item.logDate && (
                            <div className="text-[#969696]">
                              <span className="font-medium text-[#fafafa]">Date:</span> {new Date(item.logDate).toLocaleDateString()}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-[#969696]">
                              <span className="font-medium text-[#fafafa]">Notes:</span> {item.notes}
                            </div>
                          )}
                          {/* Custom Fields */}
                          {(() => {
                            const customFieldDefs = getCustomFieldDefinitions(collection)
                            const customFields = getItemCustomFields(item)
                            if (customFieldDefs.length > 0 && Object.keys(customFields).length > 0) {
                              return customFieldDefs.map((fieldDef) => {
                                const value = customFields[fieldDef.id]
                                if (value === undefined || value === null || value === '') return null
                                let displayValue = String(value)
                                if (fieldDef.type === 'date' && value) {
                                  try {
                                    displayValue = new Date(value).toLocaleDateString()
                                  } catch {}
                                }
                                return (
                                  <div key={fieldDef.id} className="text-[#969696]">
                                    <span className="font-medium text-[#fafafa]">{fieldDef.label}:</span> {displayValue}
                                  </div>
                                )
                              }).filter(Boolean)
                            }
                            return null
                          })()}
                          {!item.wear && !item.personalRating && !item.logDate && !item.notes && 
                           (!collection?.customFieldDefinitions || Object.keys(getItemCustomFields(item)).length === 0) && (
                            <div className="text-[#666] italic">No additional information</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isSelectionMode && (
                        <>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (!collection) return
                              try {
                                const res = await fetch('/api/wishlist/items', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    items: [{
                                      itemId: item.id,
                                      collectionId: collection.id,
                                      itemName: item.name,
                                      itemNumber: item.number,
                                      itemImage: item.image,
                                      collectionName: collection.name,
                                    }],
                                  }),
                                })
                                if (res.ok) {
                                  showAlert({
                                    title: 'Success',
                                    message: 'Item added to wishlist!',
                                    type: 'success',
                                  })
                                } else {
                                  const errorData = await res.json()
                                  showAlert({
                                    title: 'Error',
                                    message: errorData.error || 'Failed to add to wishlist',
                                    type: 'error',
                                  })
                                }
                              } catch (error) {
                                console.error('Error adding to wishlist:', error)
                                showAlert({
                                  title: 'Error',
                                  message: 'Failed to add to wishlist',
                                  type: 'error',
                                })
                              }
                            }}
                            className="w-6 h-6 rounded-full bg-[#FF6B9D] text-white flex items-center justify-center shadow-md hover:bg-[#E55A8A] smooth-transition"
                            title="Add to Wishlist"
                          >
                            <Heart className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingItem(item)
                            }}
                            className="w-6 h-6 rounded-full accent-button text-white flex items-center justify-center shadow-md smooth-transition"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteItem(item.id)
                            }}
                            className="w-6 h-6 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-md hover:bg-[#C0392B] smooth-transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {items.length > 0 && viewMode === 'list' && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    data-last-item={index === items.length - 1 ? true : undefined}
                    className={`rounded-lg border transition-colors animate-fade-up cursor-pointer ${
                      item.isOwned
                        ? 'bg-[#1a2e1a] border-[#34C759]'
                        : 'bg-[#1a1d24] border-[#2a2d35]'
                    } ${isSelectionMode && selectedItems.has(item.id) ? 'ring-2 ring-[var(--accent-color)]' : ''}`}
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleSelection(item.id)
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 p-3">
                    {isSelectionMode ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelection(item.id)
                        }}
                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedItems.has(item.id)
                            ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
                            : 'border-[#353842] hover:border-[var(--accent-color)]'
                        }`}
                      >
                        {selectedItems.has(item.id) && <Check className="h-4 w-4 text-white" />}
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleItemOwned(item.id, item.isOwned)}
                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          item.isOwned
                            ? 'bg-[#34C759] border-[#34C759] text-white'
                            : 'border-[#353842] hover:border-[#34C759]'
                        }`}
                      >
                        {item.isOwned && <Check className="h-4 w-4" />}
                      </button>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-[#fafafa]">
                        {item.number && `#${item.number} - `}
                        {item.name}
                      </div>
                      {item.notes && !expandedItems.has(item.id) && (
                        <div className="text-sm text-[#969696] line-clamp-1">
                          {item.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedItems)
                        if (newExpanded.has(item.id)) {
                          newExpanded.delete(item.id)
                        } else {
                          newExpanded.add(item.id)
                        }
                        setExpandedItems(newExpanded)
                      }}
                      className="flex items-center gap-1 text-sm text-[#969696] hover:text-[var(--accent-color)] smooth-transition"
                    >
                      <Info className="h-4 w-4" />
                      {expandedItems.has(item.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex gap-1">
                      {!isSelectionMode && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              if (!collection) return
                              try {
                                const res = await fetch('/api/wishlist/items', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    items: [{
                                      itemId: item.id,
                                      collectionId: collection.id,
                                      itemName: item.name,
                                      itemNumber: item.number,
                                      itemImage: item.image,
                                      collectionName: collection.name,
                                    }],
                                  }),
                                })
                                if (res.ok) {
                                  showAlert({
                                    title: 'Success',
                                    message: 'Item added to wishlist!',
                                    type: 'success',
                                  })
                                } else {
                                  const errorData = await res.json()
                                  showAlert({
                                    title: 'Error',
                                    message: errorData.error || 'Failed to add to wishlist',
                                    type: 'error',
                                  })
                                }
                              } catch (error) {
                                console.error('Error adding to wishlist:', error)
                                showAlert({
                                  title: 'Error',
                                  message: 'Failed to add to wishlist',
                                  type: 'error',
                                })
                              }
                            }}
                            className="text-[#FF6B9D] hover:text-[#FF6B9D] hover:bg-[#FF6B9D]/10 smooth-transition"
                            title="Add to Wishlist"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem(item)}
                            className="text-[var(--accent-color)] hover:text-[var(--accent-color-hover)] smooth-transition"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteItem(item.id)}
                            className="text-[#FF3B30] hover:text-[#C0392B] smooth-transition"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    {expandedItems.has(item.id) && (
                      <div className="px-3 pb-3 pt-0 border-t border-[#2a2d35] space-y-2 text-sm">
                        {item.wear && (
                          <div className="text-[#969696]">
                            <span className="font-medium text-[#fafafa]">Wear:</span> {item.wear}
                          </div>
                        )}
                        {item.personalRating && (
                          <div className="text-[#969696]">
                            <span className="font-medium text-[#fafafa]">Rating:</span> {item.personalRating}/10
                          </div>
                        )}
                        {item.logDate && (
                          <div className="text-[#969696]">
                            <span className="font-medium text-[#fafafa]">Date:</span> {new Date(item.logDate).toLocaleDateString()}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[#969696]">
                            <span className="font-medium text-[#fafafa]">Notes:</span> {item.notes}
                          </div>
                        )}
                        {/* Custom Fields */}
                        {(() => {
                          const customFieldDefs = getCustomFieldDefinitions(collection)
                          const customFields = getItemCustomFields(item)
                          if (customFieldDefs.length > 0 && Object.keys(customFields).length > 0) {
                            return customFieldDefs.map((fieldDef) => {
                              const value = customFields[fieldDef.id]
                              if (value === undefined || value === null || value === '') return null
                              let displayValue = String(value)
                              if (fieldDef.type === 'date' && value) {
                                try {
                                  displayValue = new Date(value).toLocaleDateString()
                                } catch {}
                              }
                              return (
                                <div key={fieldDef.id} className="text-[#969696]">
                                  <span className="font-medium text-[#fafafa]">{fieldDef.label}:</span> {displayValue}
                                </div>
                              )
                            }).filter(Boolean)
                          }
                          return null
                        })()}
                        {!item.wear && !item.personalRating && !item.logDate && !item.notes && 
                         (!collection?.customFieldDefinitions || Object.keys(getItemCustomFields(item)).length === 0) && (
                          <div className="text-[#666] italic">No additional information</div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
      <BulkImportDialog
        open={showBulkImport}
        onOpenChange={setShowBulkImport}
        collectionId={collectionId}
        onSuccess={() => {
          // Refresh items after bulk import
          fetchItems(1, false)
          fetchCollection()
        }}
      />
      <EditItemDialog
        open={editingItem !== null}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        collectionTemplate={collection?.template}
        customFieldDefinitions={(collection as any)?.customFieldDefinitions}
        onSave={saveItem}
      />
      {viewingAlternatives && (
        <AlternativeCoversView
          mainImage={viewingAlternatives.image}
          alternativeImages={(() => {
            try {
              return viewingAlternatives.alternativeImages 
                ? JSON.parse(viewingAlternatives.alternativeImages) 
                : []
            } catch {
              return []
            }
          })()}
          onSelectImage={async (imageUrl) => {
            // Set the selected image as the main image
            try {
              const altImages = viewingAlternatives.alternativeImages 
                ? JSON.parse(viewingAlternatives.alternativeImages) 
                : []
              const newAltImages = altImages.filter((img: string) => img !== imageUrl)
              if (viewingAlternatives.image) {
                newAltImages.push(viewingAlternatives.image)
              }

              const altCustomFields = viewingAlternatives.customFields 
                ? (typeof viewingAlternatives.customFields === 'string' 
                    ? JSON.parse(viewingAlternatives.customFields) 
                    : viewingAlternatives.customFields)
                : {}
              
              await saveItem(viewingAlternatives.id, {
                name: viewingAlternatives.name,
                number: viewingAlternatives.number,
                notes: viewingAlternatives.notes,
                image: imageUrl,
                wear: viewingAlternatives.wear,
                personalRating: viewingAlternatives.personalRating,
                logDate: viewingAlternatives.logDate,
                customFields: altCustomFields,
              })

              // Update alternative images
              const res = await fetch(`/api/items/${viewingAlternatives.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  alternativeImages: newAltImages,
                }),
              })

              if (res.ok) {
                // Refresh items after switching cover
                fetchItems(1, false)
              }
            } catch (error) {
              console.error('Error switching cover:', error)
            }
          }}
          onClose={() => setViewingAlternatives(null)}
        />
      )}
      {collection && (
        <EditCollectionDialog
          open={showEditCollection}
          onOpenChange={setShowEditCollection}
          collection={{
            id: collection.id,
            name: collection.name,
            description: collection.description,
            category: collection.category,
            coverImage: collection.coverImage || null,
            coverImageAspectRatio: collection.coverImageAspectRatio || null,
            tags: collection.tags || '[]',
          }}
          onSuccess={() => {
            setShowEditCollection(false)
            fetchCollection()
          }}
        />
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
    </>
  )
}

