'use client'

import { useEffect, useState, useRef, startTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CollectionCache } from '@/lib/collection-cache'
import { useToast } from '@/components/Toaster'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Check, X, Upload, Grid3x3, List, Edit, ChevronDown, ChevronUp, Info, Image as ImageIcon, Download, Share2, Trash2, Heart, Square, CheckSquare2, Copy, Link as LinkIcon, ArrowUpDown, MoreVertical, Package } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BulkImportDialog from './BulkImportDialog'
import EditItemDialog from './EditItemDialog'
import EditCollectionDialog from './EditCollectionDialog'
import AlternativeCoversView from './AlternativeCoversView'
import AlertDialog from './ui/alert-dialog'
import { useAlert } from '@/hooks/useAlert'
import ItemCardSkeleton from './ItemCardSkeleton'
import { getTemplateFields, type TemplateField } from '@/lib/item-templates'

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
  isInWishlist?: boolean
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

// Helper function to get template fields (either from predefined template or custom definitions)
const getTemplateFieldsForCollection = (collection: Collection | null): TemplateField[] => {
  if (!collection) return []
  
  // If it's a custom template, use customFieldDefinitions
  if (collection.template === 'custom' && collection.customFieldDefinitions) {
    return getCustomFieldDefinitions(collection) as TemplateField[]
  }
  
  // Otherwise, use predefined template fields
  return getTemplateFields(collection.template)
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
  const [enableGoldenAccents, setEnableGoldenAccents] = useState(true)
  const [autoRemoveFromWishlist, setAutoRemoveFromWishlist] = useState(true)
  const router = useRouter()
  const toast = useToast()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [itemsPage, setItemsPage] = useState(1)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [totalItemsCount, setTotalItemsCount] = useState(0)
  const [totalOwnedCount, setTotalOwnedCount] = useState(0)
  // Use refs to track latest values for observer callback
  const hasMoreItemsRef = useRef(hasMoreItems)
  const itemsPageRef = useRef(itemsPage)
  const itemsLoadingRef = useRef(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemNumber, setNewItemNumber] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [viewMode, setViewMode] = useState<'cover' | 'list'>('cover')
  const [sortBy, setSortBy] = useState<'number-asc' | 'number-desc' | 'name-asc' | 'name-desc' | 'owned' | 'not-owned' | 'rating-high' | 'rating-low' | 'date-new' | 'date-old'>('number-asc')
  const sortByRef = useRef(sortBy)
  const [showSortMenu, setShowSortMenu] = useState(false)
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
  const [openItemMenu, setOpenItemMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const { alertDialog, showAlert, showConfirm, closeAlert } = useAlert()

  useEffect(() => {
    const fetchSettings = () => {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setEnableGoldenAccents(data.enableGoldenAccents !== false)
          setAutoRemoveFromWishlist(data.autoRemoveFromWishlist !== false)
        })
        .catch(err => console.error('Error fetching user settings:', err))
    }
    
    fetchCollection()
    // Fetch user settings for golden accents
    fetchSettings()
    
    // Listen for settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      if (event.detail?.enableGoldenAccents !== undefined) {
        setEnableGoldenAccents(event.detail.enableGoldenAccents)
      }
      if (event.detail?.autoRemoveFromWishlist !== undefined) {
        setAutoRemoveFromWishlist(event.detail.autoRemoveFromWishlist)
      }
      if (event.detail?.enableGoldenAccents === undefined && event.detail?.autoRemoveFromWishlist === undefined) {
        // If other settings changed, refetch to get latest
        fetchSettings()
      }
    }
    
    // Also refetch when window gains focus (user might have changed settings in another tab)
    const handleFocus = () => {
      fetchSettings()
    }
    
    window.addEventListener('settings-updated', handleSettingsUpdate as EventListener)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate as EventListener)
      window.removeEventListener('focus', handleFocus)
    }
  }, [collectionId])
  
  // Refetch settings when component becomes visible (handles navigation back to page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetch('/api/user/profile')
          .then(res => res.json())
          .then(data => {
            setEnableGoldenAccents(data.enableGoldenAccents !== false)
          })
          .catch(err => console.error('Error fetching user settings:', err))
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (collection) {
      // Track visit count for progressive loading
      if (typeof window !== 'undefined') {
        const visitKey = `collection_visits_${collection.id}`
        const currentVisits = parseInt(localStorage.getItem(visitKey) || '0', 10)
        localStorage.setItem(visitKey, String(currentVisits + 1))
      }
      
      // Clear in-memory prefetch cache when collection or sort changes
      prefetchCacheRef.current.clear()
      // Update sortBy ref immediately
      sortByRef.current = sortBy
      
      // Check if we have cached pages for this collection/sort
      const cachedPages = CollectionCache.getAllCachedPages(collection.id, sortBy)
      
      if (cachedPages.length > 0) {
        // Load all cached pages to restore previous view
        console.log(`[CollectionDetail] Found ${cachedPages.length} cached pages, restoring...`)
        
        // Combine all cached items
        const allCachedItems: Item[] = []
        let lastPagination: any = null
        
        cachedPages.forEach(({ page, items, pagination }) => {
          allCachedItems.push(...items)
          lastPagination = pagination
        })
        
        // Set all items at once
        startTransition(() => {
          setItems(allCachedItems)
          setItemsPage(cachedPages.length)
          itemsPageRef.current = cachedPages.length
          setHasMoreItems(lastPagination?.hasMore ?? true)
          hasMoreItemsRef.current = lastPagination?.hasMore ?? true
        })
        
        // Fetch fresh data for first page in background to update cache
        const limit = getItemLimit(collection.id, true)
        fetch(`/api/collections/${collection.id}/items?page=1&limit=${limit}&sortBy=${sortBy}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              CollectionCache.setItemsPage(collection.id, 1, sortBy, data.items, data.pagination)
              // Update first page if data changed
              if (JSON.stringify(data.items) !== JSON.stringify(cachedPages[0]?.items)) {
                startTransition(() => {
                  setItems(prev => {
                    const withoutFirstPage = prev.slice(cachedPages[0]?.items.length || 0)
                    return [...data.items, ...withoutFirstPage]
                  })
                })
              }
            }
          })
          .catch(() => {}) // Silently fail background update
      } else {
        // No cache, start fresh
        setItems([])
        setItemsPage(1)
        setHasMoreItems(true)
        fetchItems(1, false)
      }
    }
  }, [collection, sortBy])

  // Items are now sorted server-side, so we can use them directly
  const sortedItems = items

  const fetchCollection = async () => {
    try {
      // Try cache first
      const cached = CollectionCache.getCollection(collectionId)
      if (cached) {
        console.log('[CollectionDetail] Using cached collection data')
        setCollection(cached)
        setIsPublic(cached.isPublic || false)
        setShareToken(cached.shareToken || null)
        setTotalItemsCount(cached._count?.items || 0)
        const ownedCount = cached.ownedCount
        if (ownedCount !== undefined && ownedCount !== null) {
          setTotalOwnedCount(ownedCount)
        }
        setLoading(false)
        
        // Background fetch disabled to reduce API calls
        // Server-side cache handles freshness (30s TTL)
        // Only fetch if user explicitly refreshes
        if (false) { // Disabled: server cache handles freshness
          fetch(`/api/collections/${collectionId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data) {
                CollectionCache.setCollection(collectionId, data)
                // Update state if data changed significantly
                if (data._count?.items !== cached._count?.items || data.ownedCount !== cached.ownedCount) {
                  setTotalItemsCount(data._count?.items || 0)
                  if (data.ownedCount !== undefined && data.ownedCount !== null) {
                    setTotalOwnedCount(data.ownedCount)
                  }
                }
              }
            })
            .catch(() => {}) // Silently fail background update
        }
        return
      }

      // No cache, fetch from API
      const res = await fetch(`/api/collections/${collectionId}`)
      if (res.ok) {
        const data = await res.json()
        setCollection(data)
        // Share settings are now included in the collection response
        setIsPublic(data.isPublic || false)
        setShareToken(data.shareToken || null)
        setTotalItemsCount(data._count?.items || 0)
        // ownedCount is calculated efficiently by the API using a count query
        const ownedCount = (data as any).ownedCount
        console.log('[CollectionDetail] API returned ownedCount:', ownedCount, 'totalItems:', data._count?.items)
        if (ownedCount !== undefined && ownedCount !== null) {
          setTotalOwnedCount(ownedCount)
        } else {
          console.warn('[CollectionDetail] ownedCount not in API response, will calculate from items when loaded')
          // Don't set to 0 here - wait for items to load and calculate from them
          // The fallback in fetchItems will handle this
        }
        // Cache the result
        CollectionCache.setCollection(collectionId, data)
      }
    } catch (error) {
      console.error('Error fetching collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const [itemsLoading, setItemsLoading] = useState(false)

  // Keep refs in sync with state
  useEffect(() => {
    hasMoreItemsRef.current = hasMoreItems
  }, [hasMoreItems])

  useEffect(() => {
    itemsPageRef.current = itemsPage
  }, [itemsPage])

  useEffect(() => {
    itemsLoadingRef.current = itemsLoading
  }, [itemsLoading])

  useEffect(() => {
    sortByRef.current = sortBy
    // Clear prefetch cache when sort changes - cached data is for different sort order
    prefetchCacheRef.current.clear()
  }, [sortBy])

  // Prefetch cache for next page (keyed by page and sortBy)
  const prefetchCacheRef = useRef<Map<string, any>>(new Map())
  
  // Progressive loading: increase limit based on visit count
  // But use larger initial loads to prevent gray spaces
  const getItemLimit = (collectionId: string, isInitialLoad: boolean = false): number => {
    if (typeof window === 'undefined') return 30 // Default for SSR
    const visitKey = `collection_visits_${collectionId}`
    const visits = parseInt(localStorage.getItem(visitKey) || '0', 10)
    
    // For initial load, always use at least 30 to prevent gray spaces
    if (isInitialLoad) {
      if (visits === 0) return 30 // Increased from 20
      if (visits === 1) return 40 // Increased from 30
      return 50
    }
    
    // For subsequent pages, use progressive limits
    if (visits === 0) return 30
    if (visits === 1) return 40
    return 50
  }
  
  const fetchItems = async (page: number = 1, append: boolean = false, useCache: boolean = false) => {
    const currentSortBy = sortByRef.current
    const limit = getItemLimit(collectionId, page === 1)
    const cacheKey = `${page}_${currentSortBy}`
    
    // Check in-memory prefetch cache first (fastest)
    if (useCache && prefetchCacheRef.current.has(cacheKey)) {
      const cachedData = prefetchCacheRef.current.get(cacheKey)
      prefetchCacheRef.current.delete(cacheKey) // Remove from cache after use
      
      startTransition(() => {
        if (append) {
          setItems(prev => [...prev, ...cachedData.items])
        } else {
          setItems(cachedData.items)
          if (page === 1 && totalOwnedCount === 0) {
            const calculatedCount = cachedData.items.filter((item: Item) => item.isOwned).length
            setTotalOwnedCount(calculatedCount)
          }
        }
        setHasMoreItems(cachedData.pagination.hasMore)
        hasMoreItemsRef.current = cachedData.pagination.hasMore
        setItemsPage(page)
        itemsPageRef.current = page
      })
      return
    }

    // Check localStorage cache (no API call needed)
    const cachedPage = CollectionCache.getItemsPage(collectionId, page, currentSortBy)
    if (cachedPage) {
      console.log(`[CollectionDetail] Using cached items page ${page}`)
      startTransition(() => {
        if (append) {
          setItems(prev => [...prev, ...cachedPage.items])
        } else {
          setItems(cachedPage.items)
          if (page === 1 && totalOwnedCount === 0) {
            const calculatedCount = cachedPage.items.filter((item: Item) => item.isOwned).length
            setTotalOwnedCount(calculatedCount)
          }
        }
        setHasMoreItems(cachedPage.pagination.hasMore)
        hasMoreItemsRef.current = cachedPage.pagination.hasMore
        setItemsPage(page)
        itemsPageRef.current = page
      })
      
      // Background fetch disabled to reduce API calls
      // Server-side cache handles freshness (30s TTL)
      return
    }
    
    // No cache, fetch from API
    if (itemsLoadingRef.current && !useCache) return // Prevent concurrent requests (unless using cache)
    setItemsLoading(true)
    itemsLoadingRef.current = true
    try {
      const res = await fetch(`/api/collections/${collectionId}/items?page=${page}&limit=${limit}&sortBy=${currentSortBy}`)
      if (res.ok) {
        const data = await res.json()
        
        // Cache the result
        CollectionCache.setItemsPage(collectionId, page, currentSortBy, data.items, data.pagination)
        
        startTransition(() => {
          if (append) {
            setItems(prev => [...prev, ...data.items])
          } else {
            setItems(data.items)
            if (page === 1 && totalOwnedCount === 0) {
              const calculatedCount = data.items.filter((item: Item) => item.isOwned).length
              console.log('[CollectionDetail] Calculated ownedCount from first page:', calculatedCount, 'out of', data.items.length, 'items')
              setTotalOwnedCount(calculatedCount)
            }
          }
          setHasMoreItems(data.pagination.hasMore)
          hasMoreItemsRef.current = data.pagination.hasMore
          setItemsPage(page)
          itemsPageRef.current = page
        })
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setItemsLoading(false)
      itemsLoadingRef.current = false
    }
  }

  // Prefetch next page when we're halfway through current items
  const prefetchNextPage = async (currentPage: number) => {
    if (itemsLoadingRef.current || !hasMoreItemsRef.current) return
    const nextPage = currentPage + 1
    const currentSortBy = sortByRef.current
    const limit = getItemLimit(collectionId, false)
    const cacheKey = `${nextPage}_${currentSortBy}`
    
    // Don't prefetch if already in cache
    if (prefetchCacheRef.current.has(cacheKey)) return
    
    try {
      const res = await fetch(`/api/collections/${collectionId}/items?page=${nextPage}&limit=${limit}&sortBy=${currentSortBy}`)
      if (res.ok) {
        const data = await res.json()
        // Only cache if sort hasn't changed during fetch
        if (sortByRef.current === currentSortBy) {
          prefetchCacheRef.current.set(cacheKey, data)
        }
      }
    } catch (error) {
      // Silently fail prefetch
    }
  }

  // Aggressive prefetching: load next pages immediately to prevent gray spaces
  useEffect(() => {
    if (!hasMoreItems || items.length === 0) return
    
    const currentSortBy = sortByRef.current
    
    // Prefetch next page immediately when first page loads (no delay)
    // This ensures items are ready before user scrolls
    if (items.length >= 3) {
      const nextPage = itemsPage + 1
      const cacheKey = `${nextPage}_${currentSortBy}`
      if (!prefetchCacheRef.current.has(cacheKey) && !itemsLoadingRef.current) {
        prefetchNextPage(itemsPage)
      }
    }
    
    // Prefetch page after next when we have more items (prefetch 2 pages ahead)
    if (items.length >= 10 && hasMoreItems) {
      const pageAfterNext = itemsPage + 2
      const cacheKey2 = `${pageAfterNext}_${currentSortBy}`
      if (!prefetchCacheRef.current.has(cacheKey2) && !itemsLoadingRef.current && hasMoreItemsRef.current) {
        // Prefetch second page ahead
        const limit2 = getItemLimit(collectionId, false)
        fetch(`/api/collections/${collectionId}/items?page=${pageAfterNext}&limit=${limit2}&sortBy=${currentSortBy}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && sortByRef.current === currentSortBy) { // Only cache if sort hasn't changed
              prefetchCacheRef.current.set(cacheKey2, data)
            }
          })
          .catch(() => {}) // Silently fail
      }
    }
  }, [items.length, itemsPage, hasMoreItems, collectionId, sortBy])

  // Silent infinite scroll - loads items as user scrolls without visible indicators
  useEffect(() => {
    if (!hasMoreItemsRef.current || items.length === 0 || itemsLoadingRef.current) return

    let observer: IntersectionObserver | null = null
    let lastItemElement: Element | null = null

    const setupObserver = () => {
      // Clean up previous observer
      if (observer && lastItemElement) {
        observer.unobserve(lastItemElement)
        observer.disconnect()
      }

      // Find the last item element
      lastItemElement = document.querySelector('[data-last-item]')
      if (!lastItemElement) return

      // Create new observer using refs to get latest values
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && hasMoreItemsRef.current && !itemsLoadingRef.current) {
              // Load next page silently using ref values
              const nextPage = itemsPageRef.current + 1
              const currentSortBy = sortByRef.current
              const cacheKey = `${nextPage}_${currentSortBy}`
              // Check if we have prefetched data for current sort order, use it if available
              if (prefetchCacheRef.current.has(cacheKey)) {
                fetchItems(nextPage, true, true)
              } else {
                // Fallback to normal fetch if no cache
                fetchItems(nextPage, true, false)
              }
            }
          })
        },
        {
          // Very aggressive rootMargin to start loading way before user reaches bottom
          // 2000px = start loading when user is still 2000px (2 screen heights) away from bottom
          // Combined with prefetching, items should already be loaded when user scrolls
          rootMargin: '2000px',
          // Use threshold to trigger earlier
          threshold: 0.01,
        }
      )

      observer.observe(lastItemElement)
    }

    // Use single requestAnimationFrame for faster setup
    const rafId = requestAnimationFrame(() => {
      setupObserver()
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (observer && lastItemElement) {
        observer.unobserve(lastItemElement)
      }
      if (observer) {
        observer.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]) // Only depend on items.length to re-setup observer when items change

  const toggleItemOwned = async (itemId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const item = items.find(i => i.id === itemId)
    
      // Optimistically update the UI immediately
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, isOwned: newStatus } : item
      ))
        // Update total owned count
        setTotalOwnedCount(prev => currentStatus ? prev - 1 : prev + 1)
        // Invalidate cache for this page - item status changed
        CollectionCache.invalidateCollection(collectionId)
    
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOwned: newStatus }),
      })

      if (res.ok) {
        const data = await res.json()
        // If item was marked as owned and auto-remove is enabled, remove from wishlist
        const shouldRemoveFromWishlist = newStatus && autoRemoveFromWishlist && item?.isInWishlist
        
        // Update with server response to ensure sync
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, isOwned: data.isOwned, isInWishlist: shouldRemoveFromWishlist ? false : item.isInWishlist } : item
        ))
        
        // If auto-remove is enabled and item was marked as owned, remove from wishlist
        if (shouldRemoveFromWishlist) {
          try {
            await fetch(`/api/wishlist/items?ids=${itemId}&byItemId=true`, {
              method: 'DELETE',
            })
            // Dispatch event to update wishlist page if open
            window.dispatchEvent(new CustomEvent('wishlist-updated'))
          } catch (error) {
            console.error('Error removing from wishlist:', error)
          }
        }
        
        // Show progress update
        const newOwned = data.isOwned ? totalOwnedCount + 1 : totalOwnedCount - 1
        const total = totalItemsCount
        const progress = total > 0 ? Math.round((newOwned / total) * 100) : 0
        const toastMessage = data.isOwned 
          ? (shouldRemoveFromWishlist 
              ? `Marked as owned and removed from wishlist! Progress: ${newOwned}/${total} (${progress}%)`
              : `Marked as owned! Progress: ${newOwned}/${total} (${progress}%)`)
          : `Removed from owned. Progress: ${newOwned}/${total} (${progress}%)`
        toast.success(toastMessage)
        
        // Handle achievements if any were unlocked
        if (data.newlyUnlockedAchievements && data.newlyUnlockedAchievements.length > 0) {
          setTimeout(() => {
            toast.success(`🎉 Achievement unlocked: ${data.newlyUnlockedAchievements.join(', ')}`, 7000)
          }, 500)
        }
      } else {
        // Revert on error
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, isOwned: currentStatus } : item
        ))
        setTotalOwnedCount(prev => currentStatus ? prev + 1 : prev - 1)
        // Invalidate cache on error too
        CollectionCache.invalidateCollection(collectionId)
        const error = await res.json()
        toast.error('Failed to update item status')
        console.error('Error updating item:', error)
      }
    } catch (error) {
      // Revert on error
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, isOwned: currentStatus } : item
      ))
      console.error('Error updating item:', error)
    }
  }

  const toggleWishlist = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const item = items.find(i => i.id === itemId)
    if (!item || !collection) return
    
    const isCurrentlyInWishlist = item.isInWishlist || false
    const newWishlistStatus = !isCurrentlyInWishlist
    
    // Optimistically update the UI
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isInWishlist: newWishlistStatus } : item
    ))
    
    try {
      if (newWishlistStatus) {
        // Add to wishlist
        const res = await fetch('/api/wishlist/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{
              itemId: item.id,
              collectionId: collectionId,
              itemName: item.name,
              itemNumber: item.number,
              itemImage: item.image,
              collectionName: collection?.name,
              notes: item.notes,
            }],
          }),
        })
        
        if (res.ok) {
          toast.success('Added to wishlist')
          window.dispatchEvent(new CustomEvent('wishlist-updated'))
        } else {
          // Revert on error
          setItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, isInWishlist: isCurrentlyInWishlist } : item
          ))
          toast.error('Failed to add to wishlist')
        }
      } else {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist/items?ids=${itemId}&byItemId=true`, {
          method: 'DELETE',
        })
        
        if (res.ok) {
          toast.success('Removed from wishlist')
          window.dispatchEvent(new CustomEvent('wishlist-updated'))
        } else {
          // Revert on error
          setItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, isInWishlist: isCurrentlyInWishlist } : item
          ))
          toast.error('Failed to remove from wishlist')
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      // Revert on error
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, isInWishlist: isCurrentlyInWishlist } : item
      ))
      toast.error('Failed to update wishlist')
    }
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    setAddingItem(true)
    try {
      // Parse number properly - handle empty strings and invalid numbers
      let parsedNumber: number | null = null
      if (newItemNumber && newItemNumber.trim()) {
        const num = parseInt(newItemNumber.trim(), 10)
        if (!isNaN(num) && num > 0) {
          parsedNumber = num
        }
      }

      // Validate collectionId before sending
      if (!collectionId || typeof collectionId !== 'string') {
        console.error('[Add Item] Invalid collectionId:', collectionId)
        showAlert({
          title: 'Error',
          message: 'Invalid collection ID. Please refresh the page and try again.',
          type: 'error',
        })
        setAddingItem(false)
        return
      }

      const trimmedCollectionId = collectionId.trim()
      
      // Log in development to debug UUID issues
      if (process.env.NODE_ENV === 'development') {
        console.log('[Add Item] Sending request with:', {
          collectionId: trimmedCollectionId,
          collectionIdLength: trimmedCollectionId.length,
          name: newItemName.trim(),
          number: parsedNumber,
        })
      }

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: trimmedCollectionId,
          name: newItemName.trim(),
          number: parsedNumber,
        }),
      })

      if (res.ok) {
        const newItem = await res.json()
        setNewItemName('')
        setNewItemNumber('')
        setShowAddForm(false)
        // Invalidate cache - items have changed
        CollectionCache.invalidateCollection(collectionId)
        // Add the new item to the list
        setItems(prev => [newItem, ...prev])
        setTotalItemsCount(prev => prev + 1)
        fetchCollection()
        
        // Show success toast with progress
        const newTotal = totalItemsCount + 1
        const newOwned = totalOwnedCount
        const progress = newTotal > 0 ? Math.round((newOwned / newTotal) * 100) : 0
        toast.success(`Item added! Progress: ${newOwned}/${newTotal} (${progress}%)`)
        
        // Show achievement notification if any were unlocked
        if (newItem.newlyUnlockedAchievements && newItem.newlyUnlockedAchievements.length > 0) {
          setTimeout(() => {
            toast.success(`🎉 Achievement unlocked: ${newItem.newlyUnlockedAchievements.join(', ')}`, 7000)
          }, 500)
        }
      } else {
        // Handle error response
        const errorData = await res.json().catch(() => ({ error: 'Failed to add item' }))
        toast.error(errorData.error || 'Failed to add item')
        showAlert({
          title: 'Error',
          message: errorData.error || 'Failed to add item',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error adding item:', error)
      showAlert({
        title: 'Error',
        message: 'An error occurred while adding the item. Please try again.',
        type: 'error',
      })
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
        // Invalidate cache - items have changed
        CollectionCache.invalidateCollection(collectionId)
        // Remove item from the list
        setItems(prev => prev.filter(item => item.id !== itemId))
        setTotalItemsCount(prev => Math.max(0, prev - 1))
        toast.success('Item deleted successfully')
        showAlert({
          title: 'Success',
          message: 'Item deleted successfully.',
          type: 'success',
        })
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete item' }))
        toast.error('Failed to delete item')
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
        // Invalidate cache - items have changed
        CollectionCache.invalidateCollection(collectionId)
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

    const itemIdsArray = Array.from(selectedItems)
    const previousItems = [...items] // Store previous state for rollback

    // Calculate how many items will change ownership status
    const selectedCount = selectedItems.size
    const currentlyOwnedInSelection = items.filter(item => selectedItems.has(item.id) && item.isOwned).length
    const changeCount = isOwned 
      ? (selectedCount - currentlyOwnedInSelection) // Items that will become owned
      : -currentlyOwnedInSelection // Items that will become not owned

    // Optimistically update the UI immediately
    setItems(prev => prev.map(item => 
      selectedItems.has(item.id) ? { ...item, isOwned } : item
    ))
    // Update total owned count
    setTotalOwnedCount(prev => prev + changeCount)

    try {
      const res = await fetch('/api/items/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: itemIdsArray, updates: { isOwned } }),
      })

      if (res.ok) {
        // Invalidate cache - items have changed
        CollectionCache.invalidateCollection(collectionId)
        clearSelection()
        showAlert({
          title: 'Success',
          message: `${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} marked as ${isOwned ? 'owned' : 'not owned'}.`,
          type: 'success',
        })
      } else {
        // Revert on error
        setItems(previousItems)
        // Revert the owned count change
        setTotalOwnedCount(prev => prev - changeCount)
        // Invalidate cache on error
        CollectionCache.invalidateCollection(collectionId)
        const errorData = await res.json()
        showAlert({
          title: 'Error',
          message: errorData.error || 'Failed to update items',
          type: 'error',
        })
      }
    } catch (error) {
      // Revert on error
      setItems(previousItems)
      setTotalOwnedCount(prev => prev - changeCount)
      // Invalidate cache on error
      CollectionCache.invalidateCollection(collectionId)
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
        // Dispatch event to refresh wishlist if open
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wishlist-updated'))
        }
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
      // Invalidate cache - item was updated
      CollectionCache.invalidateCollection(collectionId)
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
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
          <div className="container mx-auto px-6 py-8">
            {/* Header Skeleton */}
            <div className="mb-8 space-y-4 animate-pulse">
              <div className="h-8 bg-[var(--bg-tertiary)] rounded w-1/3"></div>
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-2/3"></div>
              <div className="h-2 bg-[var(--bg-tertiary)] rounded w-full"></div>
            </div>
            
            {/* Items Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!collection) {
    return (
      <>
        <Sidebar />
        <Navbar />
        <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64 flex items-center justify-center">
          <div className="text-center text-[var(--text-secondary)]">Collection not found</div>
        </div>
      </>
    )
  }

  // Use total owned count from API instead of calculating from loaded items
  const ownedCount = totalOwnedCount
  const totalCount = totalItemsCount || items.length
  const progress = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] lg:ml-64">
        <div className="container mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collections
        </Button>

        <Card className="mb-8 bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] tracking-tight break-words">{collection.name}</CardTitle>
                {collection.category && (
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded mt-2 inline-block">
                    {collection.category}
                  </span>
                )}
                {collection.description && (
                  <CardDescription className="mt-2 break-words">
                    {collection.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
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
                      <div className="absolute right-0 top-full mt-2 w-40 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-20 overflow-hidden">
                        <button
                          onClick={() => {
                            window.open(`/api/collections/${collection.id}/export?format=json`, '_blank')
                            setShowExportMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export as JSON
                        </button>
                        <button
                          onClick={() => {
                            window.open(`/api/collections/${collection.id}/export?format=csv`, '_blank')
                            setShowExportMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2 border-t border-[var(--border-color)]"
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
                  className={`border-[var(--border-hover)] smooth-transition rounded-full ${
                    isPublic
                      ? 'bg-[#34C759]/10 border-[#34C759] text-[#34C759]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
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
                    className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
                    title="Copy Share Link"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEditCollection(true)}
                  className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition rounded-full"
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
              <Progress 
                value={progress} 
                className="h-3"
                enableGradient={enableGoldenAccents}
              />
              <p className="text-sm text-muted-foreground break-words">
                {ownedCount} of {totalCount} items collected
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)] animate-fade-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-[var(--text-primary)]">Items</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">
                  Manage the items in your collection
                </CardDescription>
              </div>
              {/* Desktop: buttons in header */}
              <div className="hidden sm:flex gap-2">
              {isSelectionMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsSelectionMode(false)
                        clearSelection()
                      }}
                      className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <div className="flex items-center gap-2 px-3 text-sm text-[var(--text-secondary)]">
                      {selectedItems.size} selected
                    </div>
                    {selectedItems.size > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAll}
                          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkMarkOwned(true)}
                          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                          title="Mark as owned"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark Owned
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkMarkOwned(false)}
                          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                          title="Mark as not owned"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Mark Not Owned
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkAddToWishlist}
                          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                          title="Add to wishlist"
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Add to Wishlist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkDelete}
                          className="border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/10"
                          title="Delete selected items"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSelectionMode(true)}
                      className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                      title="Select multiple items"
                    >
                      <CheckSquare2 className="mr-2 h-4 w-4" />
                      Select
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
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
                          onClick={() => { setSortBy('number-asc'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'number-asc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Number (Low to High)
                        </button>
                        <button
                          onClick={() => { setSortBy('number-desc'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'number-desc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Number (High to Low)
                        </button>
                        <button
                          onClick={() => { setSortBy('name-asc'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'name-asc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
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
                          onClick={() => { setSortBy('owned'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'owned' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Owned First
                        </button>
                        <button
                          onClick={() => { setSortBy('not-owned'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'not-owned' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Not Owned First
                        </button>
                        <button
                          onClick={() => { setSortBy('rating-high'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'rating-high' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Rating (High to Low)
                        </button>
                        <button
                          onClick={() => { setSortBy('rating-low'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'rating-low' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Rating (Low to High)
                        </button>
                        <button
                          onClick={() => { setSortBy('date-new'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'date-new' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Date Added (Newest)
                        </button>
                        <button
                          onClick={() => { setSortBy('date-old'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'date-old' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Date Added (Oldest)
                        </button>
                      </div>
                    </>
                  )}
                    </div>
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
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          {/* Mobile: Action buttons row below header */}
          <div className="sm:hidden px-6 pb-4 border-b border-[var(--border-color)]">
            <div className="flex flex-wrap gap-2">
              {isSelectionMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsSelectionMode(false)
                        clearSelection()
                      }}
                      className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <div className="flex items-center gap-2 px-3 text-sm text-[var(--text-secondary)]">
                      {selectedItems.size} selected
                    </div>
                    {selectedItems.size > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAll}
                          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkMarkOwned(true)}
                          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                          title="Mark as owned"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark Owned
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkMarkOwned(false)}
                          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                          title="Mark as not owned"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Mark Not Owned
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkAddToWishlist}
                          className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                          title="Add to wishlist"
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Add to Wishlist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkDelete}
                          className="border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/10"
                          title="Delete selected items"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSelectionMode(true)}
                      className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                      title="Select multiple items"
                    >
                      <CheckSquare2 className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                      >
                        <ArrowUpDown className="h-4 w-4" />
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
                          onClick={() => { setSortBy('number-asc'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'number-asc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Number (Low to High)
                        </button>
                        <button
                          onClick={() => { setSortBy('number-desc'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'number-desc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Number (High to Low)
                        </button>
                        <button
                          onClick={() => { setSortBy('name-asc'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'name-asc' ? 'bg-[var(--bg-tertiary)]' : ''}`}
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
                          onClick={() => { setSortBy('owned'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'owned' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Owned First
                        </button>
                        <button
                          onClick={() => { setSortBy('not-owned'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'not-owned' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Not Owned First
                        </button>
                        <button
                          onClick={() => { setSortBy('rating-high'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'rating-high' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Rating (High to Low)
                        </button>
                        <button
                          onClick={() => { setSortBy('rating-low'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'rating-low' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Rating (Low to High)
                        </button>
                        <button
                          onClick={() => { setSortBy('date-new'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition border-t border-[var(--border-color)] ${sortBy === 'date-new' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Date Added (Newest)
                        </button>
                        <button
                          onClick={() => { setSortBy('date-old'); setShowSortMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition ${sortBy === 'date-old' ? 'bg-[var(--bg-tertiary)]' : ''}`}
                        >
                          Date Added (Oldest)
                        </button>
                      </div>
                    </>
                  )}
                    </div>
                    <Button
                      variant={viewMode === 'cover' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('cover')}
                      className={viewMode === 'cover' ? 'accent-button text-white' : 'border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}
                      title="Cover view"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'accent-button text-white' : 'border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}
                      title="List view"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </>
                )}
            </div>
          </div>
          <CardContent>
            <div className="flex flex-col gap-2 mb-4">
              {!showAddForm ? (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBulkImport(true)}
                    className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
                    size="sm"
                    title="Bulk Import Items"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Add Items
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
                      className="flex-1 bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
                      autoFocus
                    />
                    <Input
                      type="number"
                      placeholder="Number"
                      value={newItemNumber}
                      onChange={(e) => setNewItemNumber(e.target.value)}
                      className="w-24 bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#007AFF] smooth-transition"
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
                      className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {items.length === 0 && !loading && !itemsLoading && (
              <Card className="bg-[var(--bg-secondary)] border-[var(--border-color)]">
                <CardContent className="py-16 text-center">
                  <Package className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-6" />
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    This collection is empty
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                    Start building your trove by adding your first item! You can add items one at a time or use bulk import to add many items at once.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {!showAddForm && (
                      <Button
                        onClick={() => setShowAddForm(true)}
                        className="accent-button text-white smooth-transition"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Item
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkImport(true)}
                      className="border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Bulk Import Items
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {items.length === 0 && (loading || itemsLoading) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            )}
            {items.length > 0 && viewMode === 'cover' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sortedItems.map((item, index) => (
                  <div
                    key={item.id}
                    data-last-item={index === sortedItems.length - 1 ? true : undefined}
                    className={`relative group rounded-lg border-2 overflow-hidden transition-all animate-fade-up cursor-pointer ${
                      item.isOwned
                        ? 'border-[#34C759] shadow-md'
                        : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
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
                              : 'bg-[var(--bg-secondary)]/90 border-[var(--border-hover)] hover:border-[var(--accent-color)]'
                          }`}
                        >
                          {selectedItems.has(item.id) && <Check className="h-4 w-4 text-white" />}
                        </button>
                      </div>
                    )}
                    <div 
                      className="bg-[var(--bg-tertiary)] relative"
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
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            unoptimized={
                              item.image.startsWith('/ltbcover/') || 
                              item.image.includes('localhost') || 
                              item.image.includes('tcgdx') || 
                              item.image.includes('tcgdex') || 
                              item.image.toLowerCase().includes('ygoprodeck') ||
                              item.image.toLowerCase().includes('images.ygoprodeck.com')
                            }
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
                                    className="absolute bottom-2 left-2 bg-[var(--bg-secondary)]/90 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded-full border border-[var(--border-hover)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity smooth-transition z-10"
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
                            <div className="text-xs font-semibold text-[var(--text-secondary)]">
                              {item.number && `#${item.number}`}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      )}
                      {!isSelectionMode && (
                        <>
                          {item.isInWishlist ? (
                            <button
                              onClick={(e) => toggleWishlist(item.id, e)}
                              className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#FF3B30]/90 backdrop-blur-sm border border-[#FF3B30] flex items-center justify-center shadow-md z-10"
                              title="Remove from wishlist"
                            >
                              <Heart className="h-3 w-3 text-white fill-white" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => toggleWishlist(item.id, e)}
                              className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#FF69B4]/90 backdrop-blur-sm border border-[#FF69B4] flex items-center justify-center shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Add to wishlist"
                            >
                              <Heart className="h-3 w-3 text-white fill-white" />
                            </button>
                          )}
                          <button
                            onClick={() => toggleItemOwned(item.id, item.isOwned)}
                            className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-md ${
                              item.isOwned
                                ? 'bg-[#34C759] border-[#30D158] text-white'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-hover)] hover:border-[#34C759]'
                            }`}
                          >
                            {item.isOwned && <Check className="h-3 w-3" />}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="p-2 bg-[var(--bg-secondary)]">
                      <div className="text-xs font-medium truncate text-[var(--text-primary)]">
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
                        className="mt-1 flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] smooth-transition"
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
                        <div className="mt-2 pt-2 border-t border-[var(--border-color)] space-y-1 text-xs">
                          {item.wear && (
                            <div className="text-[var(--text-secondary)]">
                              <span className="font-medium text-[var(--text-primary)]">Wear:</span> {item.wear}
                            </div>
                          )}
                          {item.personalRating && (
                            <div className="text-[var(--text-secondary)]">
                              <span className="font-medium text-[var(--text-primary)]">Rating:</span> {item.personalRating}/10
                            </div>
                          )}
                          {item.logDate && (
                            <div className="text-[var(--text-secondary)]">
                              <span className="font-medium text-[var(--text-primary)]">Date:</span> {new Date(item.logDate).toLocaleDateString()}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-[var(--text-secondary)]">
                              <span className="font-medium text-[var(--text-primary)]">Notes:</span> {item.notes}
                            </div>
                          )}
                          {/* Custom Fields / Template Fields */}
                          {(() => {
                            const templateFields = getTemplateFieldsForCollection(collection)
                            const customFields = getItemCustomFields(item)
                            if (templateFields.length > 0 && Object.keys(customFields).length > 0) {
                              return templateFields.map((fieldDef) => {
                                const value = customFields[fieldDef.id]
                                if (value === undefined || value === null || value === '') return null
                                let displayValue = String(value)
                                if (fieldDef.type === 'date' && value) {
                                  try {
                                    displayValue = new Date(value).toLocaleDateString()
                                  } catch {}
                                }
                                return (
                                  <div key={fieldDef.id} className="text-[var(--text-secondary)]">
                                    <span className="font-medium text-[var(--text-primary)]">{fieldDef.label}:</span> {displayValue}
                                  </div>
                                )
                              }).filter(Boolean)
                            }
                            return null
                          })()}
                          {(() => {
                            const templateFields = getTemplateFieldsForCollection(collection)
                            const customFields = getItemCustomFields(item)
                            const hasTemplateFields = templateFields.length > 0 && Object.keys(customFields).length > 0
                            const hasStandardFields = item.wear || item.personalRating || item.logDate || item.notes
                            
                            if (!hasStandardFields && !hasTemplateFields) {
                              return <div className="text-[var(--text-muted)] italic">No additional information</div>
                            }
                            return null
                          })()}
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
                                  // Dispatch event to refresh wishlist if open
                                  if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('wishlist-updated'))
                                  }
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
                {sortedItems.map((item, index) => (
                  <div
                    key={item.id}
                    data-last-item={index === sortedItems.length - 1 ? true : undefined}
                    className={`rounded-lg border transition-colors animate-fade-up cursor-pointer ${
                      item.isOwned
                        ? 'bg-[#1a2e1a] border-[#34C759]' // Keep green for owned items
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
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
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
                    {isSelectionMode ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelection(item.id)
                        }}
                        className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedItems.has(item.id)
                            ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
                            : 'border-[#353842] hover:border-[var(--accent-color)]'
                        }`}
                      >
                        {selectedItems.has(item.id) && <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.isInWishlist ? (
                          <button
                            onClick={(e) => toggleWishlist(item.id, e)}
                            className="flex-shrink-0"
                            title="Remove from wishlist"
                          >
                            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF3B30] fill-[#FF3B30]" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => toggleWishlist(item.id, e)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Add to wishlist"
                          >
                            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF69B4] fill-[#FF69B4]" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleItemOwned(item.id, item.isOwned)}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            item.isOwned
                              ? 'bg-[#34C759] border-[#34C759] text-white'
                              : 'border-[#353842] hover:border-[#34C759]'
                          }`}
                        >
                          {item.isOwned && <Check className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </button>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base text-[var(--text-primary)] truncate">
                        {item.number && `#${item.number} - `}
                        {item.name}
                      </div>
                      {item.notes && !expandedItems.has(item.id) && (
                        <div className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-1 truncate">
                          {item.notes}
                        </div>
                      )}
                    </div>
                    {!isSelectionMode && (
                      <>
                        {/* Desktop: separate action buttons */}
                        <div className="hidden sm:flex gap-1">
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
                                  // Dispatch event to refresh wishlist if open
                                  if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('wishlist-updated'))
                                  }
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
                            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] smooth-transition p-1"
                            title={expandedItems.has(item.id) ? 'Hide Details' : 'View Details'}
                          >
                            <Info className="h-4 w-4" />
                            {expandedItems.has(item.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {/* Mobile: three-dot menu */}
                        <div className="relative flex-shrink-0 sm:hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              const button = e.currentTarget
                              const rect = button.getBoundingClientRect()
                              setMenuPosition({ x: rect.right, y: rect.bottom })
                              setOpenItemMenu(openItemMenu === item.id ? null : item.id)
                            }}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition h-8 w-8"
                            title="More options"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  {typeof window !== 'undefined' && openItemMenu === item.id && menuPosition && createPortal(
                    <>
                      <div 
                        className="fixed inset-0 z-[9998]" 
                        onClick={() => {
                          setOpenItemMenu(null)
                          setMenuPosition(null)
                        }}
                      />
                      <div 
                        className="fixed w-44 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl z-[9999] overflow-hidden"
                        style={{
                          right: `${window.innerWidth - menuPosition.x}px`,
                          top: `${menuPosition.y + 4}px`,
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenItemMenu(null)
                            setMenuPosition(null)
                            const newExpanded = new Set(expandedItems)
                            if (newExpanded.has(item.id)) {
                              newExpanded.delete(item.id)
                            } else {
                              newExpanded.add(item.id)
                            }
                            setExpandedItems(newExpanded)
                          }}
                          className="w-full px-4 py-3 min-h-[44px] text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2"
                        >
                          <Info className="h-4 w-4 text-[var(--accent-color)]" />
                          {expandedItems.has(item.id) ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            setOpenItemMenu(null)
                            setMenuPosition(null)
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
                                // Dispatch event to refresh wishlist if open
                                if (typeof window !== 'undefined') {
                                  window.dispatchEvent(new CustomEvent('wishlist-updated'))
                                }
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
                          className="w-full px-4 py-3 min-h-[44px] text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2 border-t border-[var(--border-color)]"
                        >
                          <Heart className="h-4 w-4 text-[#FF6B9D]" />
                          Add to Wishlist
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenItemMenu(null)
                            setMenuPosition(null)
                            setEditingItem(item)
                          }}
                          className="w-full px-4 py-3 min-h-[44px] text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-2 border-t border-[var(--border-color)]"
                        >
                          <Edit className="h-4 w-4 text-[var(--accent-color)]" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenItemMenu(null)
                            setMenuPosition(null)
                            deleteItem(item.id)
                          }}
                          className="w-full px-4 py-3 min-h-[44px] text-left text-sm text-[#FF3B30] hover:bg-[#FF3B30]/10 smooth-transition flex items-center gap-2 border-t border-[var(--border-color)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>,
                    document.body
                  )}
                    {expandedItems.has(item.id) && (
                      <div className="px-3 pb-3 pt-0 border-t border-[#2a2d35] space-y-2 text-sm">
                        {item.wear && (
                          <div className="text-[#969696]">
                            <span className="font-medium text-[#fafafa]">Wear:</span> {item.wear}
                          </div>
                        )}
                        {item.personalRating && (
                          <div className="text-[var(--text-secondary)]">
                            <span className="font-medium text-[var(--text-primary)]">Rating:</span> {item.personalRating}/10
                          </div>
                        )}
                        {item.logDate && (
                          <div className="text-[var(--text-secondary)]">
                            <span className="font-medium text-[var(--text-primary)]">Date:</span> {new Date(item.logDate).toLocaleDateString()}
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
                                <div key={fieldDef.id} className="text-[var(--text-secondary)]">
                                  <span className="font-medium text-[var(--text-primary)]">{fieldDef.label}:</span> {displayValue}
                                </div>
                              )
                            }).filter(Boolean)
                          }
                          return null
                        })()}
                        {!item.wear && !item.personalRating && !item.logDate && !item.notes && 
                         (!collection?.customFieldDefinitions || Object.keys(getItemCustomFields(item)).length === 0) && (
                          <div className="text-[var(--text-muted)] italic">No additional information</div>
                        )}
                      </div>
                    )}
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
        collectionTemplate={collection?.template}
        customFieldDefinitions={collection?.customFieldDefinitions}
        onSuccess={(count) => {
          // Invalidate cache - items were added
          CollectionCache.invalidateCollection(collectionId)
          // Refresh items after bulk import
          fetchItems(1, false)
          fetchCollection()
          // Show success toast
          if (count && count > 0) {
            toast.success(`Successfully added ${count} item${count > 1 ? 's' : ''}!`)
          } else {
            toast.success('Items imported successfully!')
          }
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
                // Invalidate cache - alternative images changed
                CollectionCache.invalidateCollection(collectionId)
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
            // Invalidate cache - collection metadata changed
            CollectionCache.invalidateCollection(collectionId)
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

