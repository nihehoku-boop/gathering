'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Plus, BookOpen, Trash2, Search, X, Edit, RefreshCw, AlertTriangle, Share2, Download, Upload, Users, ChevronDown, Package, ArrowUpDown } from 'lucide-react'
import CollectionCardSkeleton from './CollectionCardSkeleton'
import CreateCollectionDialog from './CreateCollectionDialog'
import EditCollectionDialog from './EditCollectionDialog'
import ImportCollectionDialog from './ImportCollectionDialog'
import { parseTags, getTagColor } from '@/lib/tags'
import TagSelector from '@/components/TagSelector'
import CollectionSyncDialog from './CollectionSyncDialog'
import AlertDialog from './ui/alert-dialog'

interface Collection {
  id: string
  name: string
  description: string | null
  category: string | null
  template?: string | null
  folderId: string | null
  folder: {
    id: string
    name: string
  } | null
  coverImage: string | null
  coverImageFit?: string | null
  tags: string
  recommendedCollectionId: string | null
  lastSyncedAt: string | null
  _count: {
    items: number
  }
  items: Array<{
    isOwned: boolean
  }>
  ownedCount?: number // Added from optimized API
  createdAt?: string
  updatedAt?: string
}

interface UpdateStatus {
  hasUpdate: boolean
  isCustomized: boolean
}

export default function CollectionsList() {
  const { data: session } = useSession()
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([])
  const [searchResults, setSearchResults] = useState<{
    collections: Array<any>
    items: Array<any>
    communityCollections: Array<any>
  } | null>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [movingCollection, setMovingCollection] = useState<string | null>(null)
  const [updateStatuses, setUpdateStatuses] = useState<Map<string, UpdateStatus>>(new Map())
  const [syncingCollection, setSyncingCollection] = useState<string | null>(null)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
    onConfirm?: () => void
    onCancel?: () => void
    showCancel?: boolean
    confirmText?: string
    cancelText?: string
  }>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  })
  const [syncCollectionId, setSyncCollectionId] = useState<string | null>(null)
  const [syncCollectionData, setSyncCollectionData] = useState<UpdateStatus | null>(null)
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'items-asc' | 'items-desc' | 'progress-asc' | 'progress-desc' | 'date-new' | 'date-old'>('name-asc')
  const [showSortMenu, setShowSortMenu] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  // Listen for storage changes to sync with sidebar drag-and-drop
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('collectionOrder_')) {
        // Trigger a re-sort by updating collections state
        // This will cause the useEffect to re-run and apply the new order
        setCollections(prev => [...prev])
      }
    }

    // Also listen for custom events from sidebar (for same-tab updates)
    const handleCustomStorageChange = () => {
      setCollections(prev => [...prev])
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('collectionOrderChanged', handleCustomStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('collectionOrderChanged', handleCustomStorageChange as EventListener)
    }
  }, [])

  useEffect(() => {
    // Check for updates for all collections that come from recommended collections
    // Run these checks in parallel after initial load to avoid blocking
    if (collections.length > 0 && !loading) {
      const collectionsToCheck = collections.filter(c => c.recommendedCollectionId)
      if (collectionsToCheck.length > 0) {
        // Run all update checks in parallel with a small delay to not block initial render
        setTimeout(() => {
          Promise.all(
            collectionsToCheck.map(collection => checkForUpdates(collection.id))
          ).catch(error => {
            console.error('Error checking for collection updates:', error)
          })
        }, 500) // Small delay to let UI render first
      }
    }
  }, [collections, loading]) // Check when collections change and after loading completes

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections', {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
      })
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched collections:', data.length, 'collections')
        setCollections(data)
        setFilteredCollections(data)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error fetching collections:', res.status, errorData)
        setAlertDialog({
          open: true,
          title: 'Error',
          message: errorData.error || `Failed to fetch collections (${res.status})`,
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'Failed to fetch collections. Please refresh the page.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Perform search API call when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length >= 2) {
        setSearchLoading(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchQuery)}&limit=20`)
          if (res.ok) {
            const data = await res.json()
            setSearchResults(data)
          }
        } catch (error) {
          console.error('Error performing search:', error)
        } finally {
          setSearchLoading(false)
        }
      } else {
        setSearchResults(null)
      }
    }

    performSearch()
  }, [debouncedSearchQuery])

  useEffect(() => {
    let filtered = [...collections] // Create a copy to avoid mutating the original

    // Filter by search query (only if not using API search results)
    if (searchQuery.trim() && (!debouncedSearchQuery || debouncedSearchQuery.length < 2)) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(collection => {
        const nameMatch = collection.name.toLowerCase().includes(query)
        const descriptionMatch = collection.description?.toLowerCase().includes(query)
        const categoryMatch = collection.category?.toLowerCase().includes(query)
        const folderMatch = collection.folder?.name.toLowerCase().includes(query)
        const tagsMatch = parseTags(collection.tags).some(tag => tag.toLowerCase().includes(query))
        return nameMatch || descriptionMatch || categoryMatch || folderMatch || tagsMatch
      })
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(collection => {
        const collectionTags = parseTags(collection.tags)
        return selectedTags.some(tag => collectionTags.includes(tag))
      })
    }

    // Sort collections
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'items-asc':
          return (a._count.items || 0) - (b._count.items || 0)
        case 'items-desc':
          return (b._count.items || 0) - (a._count.items || 0)
        case 'progress-asc':
          return calculateProgress(a) - calculateProgress(b)
        case 'progress-desc':
          return calculateProgress(b) - calculateProgress(a)
        case 'date-new':
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        case 'date-old':
          const dateAOld = new Date(a.createdAt || 0).getTime()
          const dateBOld = new Date(b.createdAt || 0).getTime()
          return dateAOld - dateBOld
        default:
          return 0
      }
    })

    // If sortBy is 'name-asc' (default), also respect sidebar order from localStorage
    if (sortBy === 'name-asc') {
      const savedOrder = typeof window !== 'undefined' 
        ? localStorage.getItem('collectionOrder_noFolder') 
        : null
      
      if (savedOrder) {
        try {
          const order = JSON.parse(savedOrder) as string[]
          const ordered = order
            .map(id => filtered.find(c => c.id === id))
            .filter(Boolean) as Collection[]
          const unordered = filtered.filter(c => !order.includes(c.id))
          filtered = [...ordered, ...unordered]
        } catch {
          // If parsing fails, keep current sort
        }
      }
    }

    setFilteredCollections(filtered)
  }, [searchQuery, selectedTags, collections, sortBy])

  const checkForUpdates = async (collectionId: string) => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/check-updates`)
      if (res.ok) {
        const data = await res.json()
        console.log('Update check result for', collectionId, ':', data)
        setUpdateStatuses(prev => {
          const newMap = new Map(prev)
          newMap.set(collectionId, {
            hasUpdate: data.hasUpdate,
            isCustomized: data.isCustomized,
          })
          return newMap
        })
      } else {
        console.error('Failed to check updates:', res.status, await res.text())
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }

  const handleSync = (collectionId: string) => {
    const status = updateStatuses.get(collectionId)
    if (status) {
      setSyncCollectionId(collectionId)
      setSyncCollectionData(status)
      setShowSyncDialog(true)
    }
  }

  const handleSyncConfirm = async (preserveCustomizations: boolean) => {
    if (!syncCollectionId) return

    setSyncingCollection(syncCollectionId)
    try {
      const res = await fetch(`/api/collections/${syncCollectionId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preserveCustomizations }),
      })

      if (res.ok) {
        setShowSyncDialog(false)
        setSyncCollectionId(null)
        setSyncCollectionData(null)
        fetchCollections()
        setAlertDialog({
          open: true,
          title: 'Success',
          message: 'Collection synced successfully!',
          type: 'success',
        })
      } else {
        const error = await res.json()
        setAlertDialog({
          open: true,
          title: 'Error',
          message: error.error || 'Failed to sync collection',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error syncing collection:', error)
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'Failed to sync collection',
        type: 'error',
      })
    } finally {
      setSyncingCollection(null)
    }
  }

  const handleDelete = async (id: string) => {
    setAlertDialog({
      open: true,
      title: 'Delete Collection',
      message: 'Are you sure you want to delete this collection? This action cannot be undone.',
      type: 'warning',
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/collections/${id}`, {
            method: 'DELETE',
          })
          if (res.ok) {
            fetchCollections()
            setAlertDialog({
              open: true,
              title: 'Success',
              message: 'Collection deleted successfully.',
              type: 'success',
            })
          } else {
            const error = await res.json()
            setAlertDialog({
              open: true,
              title: 'Error',
              message: error.error || 'Failed to delete collection',
              type: 'error',
            })
          }
        } catch (error) {
          console.error('Error deleting collection:', error)
          setAlertDialog({
            open: true,
            title: 'Error',
            message: 'Failed to delete collection. Please try again.',
            type: 'error',
          })
        }
      },
    })
  }

  const calculateProgress = (collection: Collection) => {
    if (collection._count.items === 0) return 0
    // Use ownedCount if available (from optimized API), otherwise calculate from items
    const owned = collection.ownedCount !== undefined 
      ? collection.ownedCount 
      : (collection.items?.filter(item => item.isOwned).length || 0)
    return Math.round((owned / collection._count.items) * 100)
  }

  if (loading) {
    return (
      <div>
        {/* Search and Filter Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-[var(--bg-tertiary)] rounded-md animate-pulse"></div>
            <div className="w-24 h-10 bg-[var(--bg-tertiary)] rounded-md animate-pulse"></div>
            <div className="w-32 h-10 bg-[var(--bg-tertiary)] rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Collection Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">Your Collections</h2>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="text-white smooth-transition w-full sm:w-auto"
          style={{ 
            backgroundColor: 'var(--accent-color)',
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-color-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-color)'
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">New Collection</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
          <Input
            type="text"
            placeholder="Search collections, items, tags, and more..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value.length >= 2) {
                setShowSearchResults(true)
              }
            }}
            onFocus={() => {
              if (searchQuery.length >= 2 && searchResults) {
                setShowSearchResults(true)
              }
            }}
            className="pl-10 bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSearchResults(null)
                setShowSearchResults(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] smooth-transition p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {searchLoading ? (
                <div className="p-4 text-center text-[var(--text-secondary)]">Searching...</div>
              ) : searchResults ? (
                <>
                  {searchResults.collections.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-[var(--text-muted)] px-3 py-2 font-medium">Collections</div>
                      {searchResults.collections.map((collection: any) => (
                        <button
                          key={collection.id}
                          onClick={() => {
                            router.push(`/collections/${collection.id}`)
                            setShowSearchResults(false)
                            setSearchQuery('')
                          }}
                          className="w-full text-left px-3 py-3 min-h-[44px] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2"
                        >
                          <BookOpen className="h-4 w-4 text-[var(--text-muted)]" />
                          <div className="flex-1">
                            <div className="text-sm text-[var(--text-primary)]">{collection.name}</div>
                            {collection.description && (
                              <div className="text-xs text-[var(--text-muted)] truncate">{collection.description}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.items.length > 0 && (
                    <div className="p-2 border-t border-[var(--border-color)]">
                      <div className="text-xs text-[var(--text-muted)] px-3 py-2 font-medium">Items</div>
                      {searchResults.items.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            router.push(`/collections/${item.collectionId}`)
                            setShowSearchResults(false)
                            setSearchQuery('')
                          }}
                          className="w-full text-left px-3 py-3 min-h-[44px] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2"
                        >
                          <Package className="h-4 w-4 text-[var(--text-muted)]" />
                          <div className="flex-1">
                            <div className="text-sm text-[var(--text-primary)]">
                              {item.number && `#${item.number} - `}
                              {item.name}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">{item.collectionName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.communityCollections.length > 0 && (
                    <div className="p-2 border-t border-[var(--border-color)]">
                      <div className="text-xs text-[var(--text-muted)] px-3 py-2 font-medium">Community Collections</div>
                      {searchResults.communityCollections.map((collection: any) => (
                        <button
                          key={collection.id}
                          onClick={() => {
                            router.push(`/community`)
                            setShowSearchResults(false)
                            setSearchQuery('')
                          }}
                          className="w-full text-left px-3 py-3 min-h-[44px] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2"
                        >
                          <Users className="h-4 w-4 text-[var(--text-muted)]" />
                          <div className="flex-1">
                            <div className="text-sm text-[var(--text-primary)]">{collection.name}</div>
                            {collection.description && (
                              <div className="text-xs text-[var(--text-muted)] truncate">{collection.description}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.collections.length === 0 && 
                   searchResults.items.length === 0 && 
                   searchResults.communityCollections.length === 0 && (
                    <div className="p-4 text-center text-[var(--text-secondary)]">No results found</div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {collections.length > 0 && filteredCollections.length > 0 && (
        <div className="mb-6 space-y-3">
          {/* Desktop: All buttons on one line, Filter/Sort on right */}
          {/* Mobile: Filter/Sort on one line, Import/Export below */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left side: Import and Export buttons (desktop) */}
            <div className="hidden sm:flex gap-2 items-center order-2">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
                >
                  <Download className="h-4 w-4" />
                  <span className="ml-2">Export</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        window.open('/api/collections/export?format=json', '_blank')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-3 min-h-[44px] text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export All as JSON
                    </button>
                    <button
                      onClick={() => {
                        window.open('/api/collections/export?format=csv', '_blank')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2 border-t border-[var(--border-color)]"
                    >
                      <Download className="h-4 w-4" />
                      Export All as CSV
                    </button>
                  </div>
                </>
              )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(true)}
                className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
              >
                <Upload className="h-4 w-4" />
                <span className="ml-2">Import</span>
              </Button>
            </div>

            {/* Right side: Filter and Sort buttons */}
            <div className="flex items-center gap-2 flex-wrap order-1 sm:order-3">
              <TagSelector
                selectedTags={selectedTags}
                onChange={setSelectedTags}
                label="Filter by tags"
                allowCustom={false}
                compact={true}
              />
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              {showSortMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSortMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-20 overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">
                      Sort by
                    </div>
                    <button
                      onClick={() => { setSortBy('name-asc'); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'name-asc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                    >
                      Name (A-Z)
                    </button>
                    <button
                      onClick={() => { setSortBy('name-desc'); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'name-desc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                    >
                      Name (Z-A)
                    </button>
                    <button
                      onClick={() => { setSortBy('items-desc'); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'items-desc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                    >
                      Most Items
                    </button>
                    <button
                      onClick={() => { setSortBy('items-asc'); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'items-asc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                    >
                      Fewest Items
                    </button>
                    <button
                      onClick={() => { setSortBy('progress-desc'); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'progress-desc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                    >
                      Highest Progress
                    </button>
                    <button
                      onClick={() => { setSortBy('progress-asc'); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'progress-asc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                    >
                      Lowest Progress
                    </button>
                    <button
                      onClick={() => { setSortBy('date-new'); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'date-new' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => { setSortBy('date-old'); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'date-old' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                    >
                      Oldest First
                    </button>
                  </div>
                </>
              )}
              </div>
              {(searchQuery || selectedTags.length > 0) && (
                <div className="text-sm text-[var(--text-muted)] whitespace-nowrap ml-auto sm:ml-0">
                  Showing {filteredCollections.length} of {collections.length} collections
                </div>
              )}
            </div>
            
            {/* Mobile: Import and Export buttons below */}
            <div className="flex gap-2 items-center sm:hidden order-2">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
                >
                  <Download className="h-4 w-4" />
                </Button>
              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        window.open('/api/collections/export?format=json', '_blank')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-3 min-h-[44px] text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export All as JSON
                    </button>
                    <button
                      onClick={() => {
                        window.open('/api/collections/export?format=csv', '_blank')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2 border-t border-[var(--border-color)]"
                    >
                      <Download className="h-4 w-4" />
                      Export All as CSV
                    </button>
                  </div>
                </>
              )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(true)}
                className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {collections.length === 0 ? (
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-6" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              No collections yet
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Start tracking your collections by creating your first one!
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="text-white smooth-transition"
              style={{ 
                backgroundColor: 'var(--accent-color)',
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-color-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-color)'
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
          </CardContent>
        </Card>
      ) : filteredCollections.length === 0 ? (
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
          <CardContent className="py-16 text-center">
            <Search className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-6" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              No collections found
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedTags([])
              }}
              variant="outline"
              className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCollections.map((collection, index) => {
            const progress = calculateProgress(collection)
            return (
              <Card
                key={collection.id}
                className="bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--border-hover)] hover-lift cursor-pointer overflow-hidden smooth-transition group animate-fade-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                onClick={() => router.push(`/collections/${collection.id}`)}
              >
                {collection.coverImage && (
                  <div className="w-full h-48 overflow-hidden bg-[var(--bg-tertiary)] relative">
                    <Image
                      src={collection.coverImage}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={`${collection.coverImageFit === 'contain' ? 'object-contain' : 'object-cover'} group-hover:scale-105 smooth-transition`}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      unoptimized={
                        collection.coverImage.startsWith('/ltbcover/') || 
                        collection.coverImage.includes('localhost') || 
                        collection.coverImage.includes('tcgdx') || 
                        collection.coverImage.includes('tcgdex') ||
                        collection.coverImage.toLowerCase().includes('ygoprodeck') ||
                        collection.coverImage.toLowerCase().includes('images.ygoprodeck.com')
                      }
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-[var(--text-primary)]">{collection.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {collection.folder && (
                          <span className="text-xs text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-1 rounded-full inline-block border border-[var(--accent-color)]/30" title={`Folder: ${collection.folder.name}`}>
                            📁 {collection.folder.name}
                          </span>
                        )}
                        {collection.category && (
                          <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-full inline-block" title={collection.category}>
                            {collection.category}
                          </span>
                        )}
                        {parseTags(collection.tags).map((tag) => {
                          const colors = getTagColor(tag)
                          return (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-md border"
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
                    </div>
                    <div className="flex gap-1">
                      {(() => {
                        const updateStatus = updateStatuses.get(collection.id)
                        console.log('Collection:', collection.id, 'Update status:', updateStatus, 'Has recommendedCollectionId:', collection.recommendedCollectionId)
                        if (updateStatus?.hasUpdate) {
                          return (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSync(collection.id)
                              }}
                              className="text-[#FF9500] hover:text-[#FF9500] hover:bg-[var(--bg-tertiary)] smooth-transition relative"
                              title={updateStatus.isCustomized ? 'Update available (customized)' : 'Update available'}
                            >
                              <RefreshCw className="h-4 w-4" />
                              {updateStatus.isCustomized && (
                                <AlertTriangle className="absolute -top-1 -right-1 h-3 w-3 text-[#FF3B30]" />
                              )}
                            </Button>
                          )
                        }
                        // Show a placeholder or debug info if collection has recommendedCollectionId but no update status yet
                        if (collection.recommendedCollectionId && updateStatus === undefined) {
                          return (
                            <div className="w-8 h-8 flex items-center justify-center" title="Checking for updates...">
                              <div className="w-3 h-3 border-2 border-[#666] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )
                        }
                        return null
                      })()}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAlertDialog({
                            open: true,
                            title: 'Share to Community',
                            message: 'Share this collection to the community? Others will be able to add it to their collections.',
                            type: 'info',
                            showCancel: true,
                            confirmText: 'Share',
                            cancelText: 'Cancel',
                            onConfirm: async () => {
                              try {
                                const res = await fetch(`/api/collections/${collection.id}/share-to-community`, {
                                  method: 'POST',
                                })
                                if (res.ok) {
                                  setAlertDialog({
                                    open: true,
                                    title: 'Success',
                                    message: 'Collection shared to community successfully!',
                                    type: 'success',
                                    onConfirm: () => {
                                      router.push('/community')
                                    },
                                  })
                                } else {
                                  const error = await res.json()
                                  setAlertDialog({
                                    open: true,
                                    title: 'Error',
                                    message: error.error || 'Failed to share collection',
                                    type: 'error',
                                  })
                                }
                              } catch (error) {
                                console.error('Error sharing collection:', error)
                                setAlertDialog({
                                  open: true,
                                  title: 'Error',
                                  message: 'Failed to share collection',
                                  type: 'error',
                                })
                              }
                            },
                          })
                        }}
                        className="text-[var(--accent-color)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-tertiary)] smooth-transition"
                        title="Share to Community"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCollection(collection)
                        }}
                        className="text-[var(--accent-color)] hover:text-[var(--accent-color-hover)] hover:bg-[var(--bg-tertiary)] smooth-transition"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(collection.id)
                        }}
                        className="text-[#FF3B30] hover:text-[#FF3B30] hover:bg-[var(--bg-tertiary)] smooth-transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {collection.description && (
                    <CardDescription className="mt-3 text-[var(--text-secondary)]">
                      {collection.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Progress</span>
                      <span className="font-semibold text-[var(--text-primary)]">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <p className="text-xs text-[var(--text-muted)]">
                      {collection.items.filter(i => i.isOwned).length} of {collection._count.items} items
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CreateCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchCollections}
      />
      <ImportCollectionDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={fetchCollections}
      />
      <EditCollectionDialog
        open={editingCollection !== null}
        onOpenChange={(open) => !open && setEditingCollection(null)}
        collection={editingCollection}
        onSuccess={fetchCollections}
      />
      <CollectionSyncDialog
        open={showSyncDialog}
        onOpenChange={setShowSyncDialog}
        isCustomized={syncCollectionData?.isCustomized || false}
        onConfirm={handleSyncConfirm}
        loading={syncingCollection !== null}
      />
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
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

