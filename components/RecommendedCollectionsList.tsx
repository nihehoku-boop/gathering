'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Search, Filter, X, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { parseTags, getTagColor, AVAILABLE_TAGS } from '@/lib/tags'
import AlertDialog from './ui/alert-dialog'
import { useAlert } from '@/hooks/useAlert'
import CollectionCardSkeleton from './CollectionCardSkeleton'
import AddCollectionPreviewDialog from './AddCollectionPreviewDialog'

interface RecommendedItem {
  id: string
  name: string
  number: number | null
}

interface RecommendedCollection {
  id: string
  name: string
  description: string | null
  category: string | null
  coverImage: string | null
  coverImageFit?: string | null
  tags: string
  items: RecommendedItem[]
  createdAt?: string
}

export default function RecommendedCollectionsList() {
  const router = useRouter()
  const [collections, setCollections] = useState<RecommendedCollection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<RecommendedCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [addingCollection, setAddingCollection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostItems' | 'leastItems' | 'alphabetical'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const { alertDialog, showAlert, closeAlert } = useAlert()

  useEffect(() => {
    fetchCollections()
    
    // Listen for updates from admin dashboard
    const handleUpdate = () => {
      console.log('[RecommendedCollectionsList] Received update event, refreshing...')
      // Force refresh to bypass cache after deletions/updates
      // Small delay to ensure server-side changes are committed
      setTimeout(() => {
        fetchCollections(true)
      }, 100)
    }
    
    window.addEventListener('recommendedCollectionsUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('recommendedCollectionsUpdated', handleUpdate)
    }
  }, [])

  const fetchCollections = async (forceRefresh = false) => {
    try {
      setLoading(true) // Set loading state when fetching
      console.log('[RecommendedCollectionsList] Fetching collections...', { forceRefresh })
      const startTime = performance.now()
      // Always add cache-busting query parameter to ensure fresh data
      // The API will bypass cache when this parameter is present
      const url = `/api/recommended-collections?t=${Date.now()}`
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      })
      const endTime = performance.now()
      console.log(`[RecommendedCollectionsList] Fetch completed in ${(endTime - startTime).toFixed(2)}ms`)
      if (res.ok) {
        const data = await res.json()
        console.log('[RecommendedCollectionsList] Received collections:', data.length)
        setCollections(data)
        setFilteredCollections(data)
      } else {
        console.error('[RecommendedCollectionsList] Fetch failed:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('Error fetching recommended collections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...collections]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(collection => {
        const nameMatch = collection.name.toLowerCase().includes(query)
        const descriptionMatch = collection.description?.toLowerCase().includes(query)
        const categoryMatch = collection.category?.toLowerCase().includes(query)
        return nameMatch || descriptionMatch || categoryMatch
      })
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(collection => 
        collection.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(collection => {
        const collectionTags = parseTags(collection.tags || '[]')
        return selectedTags.every(tag => collectionTags.includes(tag))
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        case 'mostItems':
          return b.items.length - a.items.length
        case 'leastItems':
          return a.items.length - b.items.length
        case 'alphabetical':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredCollections(filtered)
  }, [searchQuery, collections, selectedCategory, selectedTags, sortBy])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const getUniqueCategories = () => {
    const categories = collections
      .map(c => c.category)
      .filter((cat): cat is string => cat !== null && cat !== '')
    return Array.from(new Set(categories)).sort()
  }

  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewCollectionId, setPreviewCollectionId] = useState<string | null>(null)

  const handleAddToAccount = async (collectionId: string) => {
    setPreviewCollectionId(collectionId)
    setShowPreviewDialog(true)
  }

  const confirmAddToAccount = async () => {
    if (!previewCollectionId) return
    setAddingCollection(previewCollectionId)
    try {
      const res = await fetch(`/api/recommended-collections/${previewCollectionId}/add-to-account`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        showAlert({
          title: 'Success',
          message: `Collection "${data.name}" added to your account!`,
          type: 'success',
          onConfirm: () => {
            // Don't auto-redirect, let user stay or navigate manually
          },
          confirmText: 'OK',
          showCancel: false,
        })
        // Close preview dialog
        setShowPreviewDialog(false)
        setPreviewCollectionId(null)
        
        // Dispatch event to notify CollectionsList to refresh
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('collectionsUpdated'))
        }, 100)
        
        // Refresh collections list
        fetchCollections()
      } else {
        const error = await res.json()
        showAlert({
          title: 'Error',
          message: error.error || 'Failed to add collection',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error adding collection:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to add collection',
        type: 'error',
      })
    } finally {
      setAddingCollection(null)
    }
  }

  if (loading) {
    return (
      <div>
        {/* Search and Filter Skeleton */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-[var(--bg-tertiary)] rounded-md animate-pulse"></div>
            <div className="w-24 h-10 bg-[var(--bg-tertiary)] rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Collection Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <Input
              type="text"
              placeholder="Search collections by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${
              (selectedCategory || selectedTags.length > 0) ? 'border-[var(--accent-color)]' : ''
            }`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(selectedCategory || selectedTags.length > 0) && (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--accent-color)] text-white rounded-full text-xs">
                {[selectedCategory && '1', selectedTags.length > 0 && selectedTags.length].filter(Boolean).join('+')}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('')
                    setSelectedTags([])
                  }}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Category</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-hover)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none appearance-none"
                    >
                      <option value="">All Categories</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)] pointer-events-none" />
                  </div>
                </div>

                {/* Tag Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag)
                      const colors = getTagColor(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-2 py-1 rounded-full text-xs smooth-transition border ${
                            isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: isSelected ? colors.bg : '#2a2d35',
                            color: isSelected ? colors.text : '#fafafa',
                            borderColor: isSelected ? colors.border : '#353842',
                          }}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Sort By</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-hover)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none appearance-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="mostItems">Most Items</option>
                      <option value="leastItems">Least Items</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)] pointer-events-none" />
                  </div>
                </div>
              </div>

              {(selectedCategory || selectedTags.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2a2d35]">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full text-xs">
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="hover:text-[var(--accent-color)]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedTags.map(tag => {
                    const colors = getTagColor(tag)
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderColor: colors.border,
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => toggleTag(tag)}
                          className="hover:opacity-70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>
        )}

        {(searchQuery || selectedCategory || selectedTags.length > 0) && (
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {filteredCollections.length} of {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {collections.length === 0 ? (
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[#353842] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No recommended collections available
            </h3>
            <p className="text-[var(--text-secondary)]">
              Check back later for curated collections!
            </p>
          </CardContent>
        </Card>
      ) : filteredCollections.length === 0 ? (
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-[#353842] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No collections found
            </h3>
            <p className="text-[var(--text-secondary)]">
              Try adjusting your search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection, index) => (
            <Card 
              key={collection.id} 
              className="bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)] hover-lift cursor-pointer overflow-hidden smooth-transition group relative flex flex-col h-full animate-fade-up"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {collection.coverImage && (
                <div className="w-full h-48 overflow-hidden bg-[var(--bg-tertiary)] flex-shrink-0">
                  <img
                    src={collection.coverImage}
                    alt={collection.name}
                    className={`w-full h-full ${collection.coverImageFit === 'contain' ? 'object-contain' : 'object-cover'} group-hover:scale-105 smooth-transition`}
                  />
                </div>
              )}
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-xl text-[var(--text-primary)]">{collection.name}</CardTitle>
                {collection.category && (
                  <div className="mt-1">
                    <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-full inline-block" title={collection.category}>
                      {collection.category}
                    </span>
                  </div>
                )}
                {collection.description && (
                  <CardDescription className="mt-2 text-[var(--text-secondary)] line-clamp-3">
                    {collection.description}
                  </CardDescription>
                )}
                {(() => {
                  const tags = parseTags(collection.tags || '[]')
                  return tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((tag) => {
                        const colors = getTagColor(tag)
                        return (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 text-xs rounded-full border"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                              borderColor: colors.border,
                            }}
                          >
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                  )
                })()}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {collection.items.length} items included
                  </p>
                  <div className="flex justify-end">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToAccount(collection.id)
                      }}
                      disabled={addingCollection === collection.id}
                      className="accent-button text-white smooth-transition"
                      size="sm"
                    >
                      {addingCollection === collection.id ? (
                        'Adding...'
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add to My Collections
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AddCollectionPreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        collectionId={previewCollectionId || ''}
        collectionType="recommended"
        onConfirm={confirmAddToAccount}
      />
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

