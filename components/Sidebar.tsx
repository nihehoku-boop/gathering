'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Star, Users, BookOpen, ChevronRight, ChevronDown, X, Heart, Folder, FolderPlus, Trash2, Edit, GripVertical, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { useAlert } from '@/hooks/useAlert'
import AlertDialog from './ui/alert-dialog'
import CreateCollectionDialog from './CreateCollectionDialog'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Collection {
  id: string
  name: string
  folderId?: string | null
  _count?: {
    items: number
  }
  items?: Array<{
    isOwned: boolean
  }>
}

interface Folder {
  id: string
  name: string
  _count?: {
    collections: number
  }
}

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isSidebarOpen, setIsSidebarOpen } = useMobileMenu()
  const [collections, setCollections] = useState<Collection[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname, setIsSidebarOpen])
  const [showProgress, setShowProgress] = useState(() => {
    // Initialize from localStorage immediately to prevent flicker
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showProgressInSidebar')
      return saved !== 'false'
    }
    return true
  })
  const [isMounted, setIsMounted] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { alertDialog, showAlert, closeAlert } = useAlert()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/collections')
      if (res.ok) {
        const data = await res.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }, [])

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/folders')
      if (res.ok) {
        const data = await res.json()
        setFolders(data)
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchCollections()
      fetchFolders()
    }
  }, [session, fetchCollections, fetchFolders])
  
  useEffect(() => {
    if (!isMounted) return
    
    // Listen for storage changes to update progress visibility
    const handleStorageChange = () => {
      const savedShowProgress = localStorage.getItem('showProgressInSidebar')
      setShowProgress(savedShowProgress !== 'false')
    }
    window.addEventListener('storage', handleStorageChange)
    // Check less frequently (2 seconds instead of 500ms)
    const interval = setInterval(() => {
      const savedShowProgress = localStorage.getItem('showProgressInSidebar')
      setShowProgress(savedShowProgress !== 'false')
    }, 2000)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [isMounted])

  // Calculate overall progress across all collections (memoized)
  const { totalItems, ownedItems, percentage } = useMemo(() => {
    let total = 0
    let owned = 0

    collections.forEach(collection => {
      // Use ownedCount if available (from optimized API), otherwise calculate from items
      if ((collection as any).ownedCount !== undefined) {
        total += collection._count?.items || 0
        owned += (collection as any).ownedCount || 0
      } else if (collection.items && collection.items.length > 0) {
        total += collection.items.length
        owned += collection.items.filter(item => item.isOwned).length
      } else if (collection._count?.items) {
        // Fallback if items array is not available and no ownedCount
        total += collection._count.items
        // Can't calculate owned without items array or ownedCount
      }
    })

    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0
    return { totalItems: total, ownedItems: owned, percentage }
  }, [collections])

  const isActive = useCallback((path: string) => {
    if (path === '/recommended') {
      return pathname === '/recommended'
    }
    if (path === '/community') {
      return pathname === '/community'
    }
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }, [pathname])

  const isCollectionActive = useCallback((collectionId: string) => {
    return pathname === `/collections/${collectionId}`
  }, [pathname])

  const toggleFolder = useCallback((folderId: string) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }, [])

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) {
      setShowNewFolderInput(false)
      return
    }

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      })

      if (res.ok) {
        const folder = await res.json()
        setFolders(prev => [...prev, folder])
        setNewFolderName('')
        setShowNewFolderInput(false)
        setOpenFolders(prev => new Set([...Array.from(prev), folder.id]))
      }
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }, [newFolderName])

  const handleDeleteFolder = useCallback(async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this folder? Collections in it will be moved to "All Collections".')) {
      return
    }

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setFolders(prev => prev.filter(f => f.id !== folderId))
        setOpenFolders(prev => {
          const newSet = new Set(prev)
          newSet.delete(folderId)
          return newSet
        })
        fetchCollections() // Refresh collections to update folderId
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }, [fetchCollections])

  const handleEditFolder = useCallback(async (folderId: string, newName: string) => {
    if (!newName.trim()) {
      setEditingFolder(null)
      return
    }

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (res.ok) {
        const updatedFolder = await res.json()
        setFolders(prev => prev.map(f => f.id === folderId ? updatedFolder : f))
        setEditingFolder(null)
      }
    } catch (error) {
      console.error('Error updating folder:', error)
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group collections by folder
  const collectionsByFolder = useMemo(() => {
    const grouped: Record<string, Collection[]> = {}
    const noFolder: Collection[] = []

    collections.forEach(collection => {
      if (collection.folderId) {
        if (!grouped[collection.folderId]) {
          grouped[collection.folderId] = []
        }
        grouped[collection.folderId].push(collection)
      } else {
        noFolder.push(collection)
      }
    })

    // Apply saved order from localStorage, fallback to alphabetical
    const applyOrder = (collections: Collection[], orderKey: string) => {
      const savedOrder = typeof window !== 'undefined' 
        ? localStorage.getItem(orderKey) 
        : null
      
      if (savedOrder) {
        try {
          const order = JSON.parse(savedOrder) as string[]
          const ordered = order
            .map(id => collections.find(c => c.id === id))
            .filter(Boolean) as Collection[]
          const unordered = collections.filter(c => !order.includes(c.id))
          return [...ordered, ...unordered]
        } catch {
          // If parsing fails, fall back to alphabetical
          return collections.sort((a, b) => a.name.localeCompare(b.name))
        }
      }
      // Default to alphabetical if no saved order
      return collections.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Apply order to each folder
    for (const folderId in grouped) {
      grouped[folderId] = applyOrder(grouped[folderId], `collectionOrder_${folderId}`)
    }
    // Apply order to noFolder collections using the same applyOrder function
    const savedNoFolderOrder = typeof window !== 'undefined' 
      ? localStorage.getItem('collectionOrder_noFolder') 
      : null
    if (savedNoFolderOrder) {
      try {
        const order = JSON.parse(savedNoFolderOrder) as string[]
        const ordered = order
          .map(id => noFolder.find(c => c.id === id))
          .filter(Boolean) as Collection[]
        const unordered = noFolder.filter(c => !order.includes(c.id))
        // Replace noFolder array contents
        noFolder.splice(0, noFolder.length, ...ordered, ...unordered)
      } catch {
        noFolder.sort((a, b) => a.name.localeCompare(b.name))
      }
    } else {
      noFolder.sort((a, b) => a.name.localeCompare(b.name))
    }

    return { grouped, noFolder }
  }, [collections])

  const handleCollectionDragEnd = useCallback((event: DragEndEvent, folderId: string | null) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setCollections((prev) => {
      const targetCollections = folderId 
        ? prev.filter(c => c.folderId === folderId)
        : prev.filter(c => !c.folderId)
      
      const otherCollections = folderId
        ? prev.filter(c => c.folderId !== folderId)
        : prev.filter(c => c.folderId)

      const oldIndex = targetCollections.findIndex((c) => c.id === active.id)
      const newIndex = targetCollections.findIndex((c) => c.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(targetCollections, oldIndex, newIndex)
        
        // Save order to localStorage
        const orderKey = folderId ? `collectionOrder_${folderId}` : 'collectionOrder_noFolder'
        const order = reordered.map(c => c.id)
        localStorage.setItem(orderKey, JSON.stringify(order))
        
        // Return reordered collections combined with others
        return [...otherCollections, ...reordered]
      }
      
      return prev
    })
  }, [])

  // Sortable collection item component
  function SortableCollectionItem({ collection, folderId }: { collection: Collection; folderId: string | null }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: collection.id })
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }
    
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-full text-left smooth-transition text-sm truncate group",
          isCollectionActive(collection.id)
            ? "bg-[#2a2d35] text-[#fafafa]"
            : "text-[#666] hover:text-[#fafafa] hover:bg-[#2a2d35]"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#666] hover:text-[#fafafa] opacity-0 group-hover:opacity-100 smooth-transition p-1 -ml-1"
          title="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </div>
        <button
          onClick={() => {
            router.push(`/collections/${collection.id}`)
            setIsSidebarOpen(false)
          }}
          className="truncate flex-1 text-left"
        >
          {collection.name}
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay with swipe to close */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          onTouchStart={(e) => {
            const touch = e.touches[0]
            touchStartX.current = touch.clientX
            touchStartY.current = touch.clientY
          }}
          onTouchMove={(e) => {
            if (touchStartX.current !== null && touchStartY.current !== null) {
              const touch = e.touches[0]
              const deltaX = touch.clientX - touchStartX.current
              const deltaY = touch.clientY - touchStartY.current
              
              // If swiping left more than right, and more horizontal than vertical
              if (deltaX < -10 && Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault()
              }
            }
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current !== null) {
              const touch = e.changedTouches[0]
              const deltaX = touch.clientX - touchStartX.current
              
              // If swiped left more than 50px, close sidebar
              if (deltaX < -50) {
                setIsSidebarOpen(false)
              }
            }
            touchStartX.current = null
            touchStartY.current = null
          }}
        />
      )}

      {/* Sidebar with swipe to close */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-[#1a1d24] border-r border-[#2a2d35] z-50 transition-transform duration-300 ease-in-out will-change-transform",
          "lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ 
          opacity: isMounted ? 1 : 0,
          transition: 'opacity 0.2s ease-in, transform 0.3s ease-in-out'
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          touchStartX.current = touch.clientX
          touchStartY.current = touch.clientY
        }}
        onTouchMove={(e) => {
          if (isSidebarOpen && touchStartX.current !== null) {
            const touch = e.touches[0]
            const deltaX = touch.clientX - touchStartX.current
            
            // If swiping left (closing), allow it
            if (deltaX < -10) {
              e.preventDefault()
            }
          }
        }}
        onTouchEnd={(e) => {
          if (isSidebarOpen && touchStartX.current !== null) {
            const touch = e.changedTouches[0]
            const deltaX = touch.clientX - touchStartX.current
            
            // If swiped left more than 50px, close sidebar
            if (deltaX < -50) {
              setIsSidebarOpen(false)
            }
          }
          touchStartX.current = null
          touchStartY.current = null
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2a2d35]">
            <h2 className="text-xl font-semibold text-[#fafafa] tracking-tight">
              Gathering
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-[#969696] hover:text-[#fafafa] smooth-transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* Recommended */}
            <button
              onClick={() => {
                router.push('/recommended')
                setIsSidebarOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-full text-left smooth-transition",
                isActive('/recommended')
                  ? "bg-[var(--accent-color)] text-white"
                  : "text-[#969696] hover:text-[#fafafa] hover:bg-[#2a2d35]"
              )}
            >
              <Star className="h-5 w-5" />
              <span className="font-medium">Recommended</span>
            </button>

            {/* Community Collections */}
            <button
              onClick={() => {
                router.push('/community')
                setIsSidebarOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-full text-left smooth-transition",
                isActive('/community')
                  ? "bg-[var(--accent-color)] text-white"
                  : "text-[#969696] hover:text-[#fafafa] hover:bg-[#2a2d35]"
              )}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Community</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                router.push('/wishlist')
                setIsSidebarOpen(false)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-full text-left smooth-transition",
                isActive('/wishlist')
                  ? "bg-[var(--accent-color)] text-white"
                  : "text-[#969696] hover:text-[#fafafa] hover:bg-[#2a2d35]"
              )}
            >
              <Heart className="h-5 w-5" />
              <span className="font-medium">Wishlist</span>
            </button>

            {/* Your Collections */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCollectionsOpen(!isCollectionsOpen)
                    if (!isCollectionsOpen) {
                      router.push('/')
                      setIsSidebarOpen(false)
                    }
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-between px-4 py-3 rounded-full text-left smooth-transition",
                    isActive('/') && !isCollectionsOpen
                      ? "bg-[var(--accent-color)] text-white"
                      : "text-[#969696] hover:text-[#fafafa] hover:bg-[#2a2d35]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">Your Collections</span>
                  </div>
                  {isCollectionsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Collections List */}
              {isCollectionsOpen && (
                <div className="mt-1 ml-4 space-y-1 border-l border-[#2a2d35] pl-4">
                  <button
                    onClick={() => {
                      router.push('/')
                      setIsSidebarOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-full text-left smooth-transition text-sm",
                      pathname === '/'
                        ? "bg-[#2a2d35] text-[#fafafa]"
                        : "text-[#666] hover:text-[#fafafa] hover:bg-[#2a2d35]"
                    )}
                  >
                    <span>All Collections</span>
                  </button>

                  {/* Create Folder Input - Only shown when active */}
                  {showNewFolderInput && (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateFolder()
                          } else if (e.key === 'Escape') {
                            setNewFolderName('')
                            setShowNewFolderInput(false)
                          }
                        }}
                        onBlur={() => {
                          if (!newFolderName.trim()) {
                            setShowNewFolderInput(false)
                          }
                        }}
                        placeholder="Folder name..."
                        autoFocus
                        className="flex-1 px-2 py-1 text-xs bg-[#2a2d35] border border-[#3a3d45] rounded text-[#fafafa] placeholder-[#666] focus:outline-none focus:border-[var(--accent-color)]"
                      />
                      <button
                        onClick={handleCreateFolder}
                        className="p-1 text-[var(--accent-color)] hover:text-[var(--accent-color)]/80 smooth-transition"
                        title="Create folder"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setNewFolderName('')
                          setShowNewFolderInput(false)
                        }}
                        className="p-1 text-[#666] hover:text-[#fafafa] smooth-transition"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Folders */}
                  {folders.map((folder) => {
                    const isOpen = openFolders.has(folder.id)
                    const folderCollections = collectionsByFolder.grouped[folder.id] || []

                    return (
                      <div key={folder.id} className="space-y-1">
                        <div className="flex items-center group">
                          <button
                            onClick={() => toggleFolder(folder.id)}
                            className={cn(
                              "flex-1 flex items-center gap-2 px-3 py-2 rounded-full text-left smooth-transition text-sm relative",
                              "text-[#666] hover:text-[#fafafa] hover:bg-[#2a2d35]"
                            )}
                          >
                            {isOpen ? (
                              <ChevronDown className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 flex-shrink-0" />
                            )}
                            <Folder className="h-3 w-3 flex-shrink-0 absolute left-8" />
                            <div className="flex items-center gap-1 flex-1 ml-5 min-w-0">
                              {editingFolder === folder.id ? (
                                <input
                                  type="text"
                                  defaultValue={folder.name}
                                  onBlur={(e) => handleEditFolder(folder.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEditFolder(folder.id, e.currentTarget.value)
                                    } else if (e.key === 'Escape') {
                                      setEditingFolder(null)
                                    }
                                  }}
                                  autoFocus
                                  className="flex-1 px-1 text-xs bg-[#1a1d24] border border-[var(--accent-color)] rounded text-[#fafafa] focus:outline-none"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className="truncate flex-1">{folder.name}</span>
                              )}
                              {folder._count && (
                                <span className="text-xs text-[#666] flex-shrink-0">({folder._count.collections})</span>
                              )}
                            </div>
                          </button>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 smooth-transition">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingFolder(folder.id)
                              }}
                              className="p-1 text-[#666] hover:text-[var(--accent-color)] smooth-transition"
                              title="Rename folder"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteFolder(folder.id, e)}
                              className="p-1 text-[#666] hover:text-red-400 smooth-transition"
                              title="Delete folder"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {isOpen && folderCollections.length > 0 && (
                          <div className="ml-6 space-y-1 border-l border-[#2a2d35] pl-3">
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(e) => handleCollectionDragEnd(e, folder.id)}
                            >
                              <SortableContext
                                items={folderCollections.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                {folderCollections.map((collection) => (
                                  <SortableCollectionItem
                                    key={collection.id}
                                    collection={collection}
                                    folderId={folder.id}
                                  />
                                ))}
                              </SortableContext>
                            </DndContext>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Collections without folder */}
                  {collectionsByFolder.noFolder.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleCollectionDragEnd(e, null)}
                      >
                        <SortableContext
                          items={collectionsByFolder.noFolder.map(c => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {collectionsByFolder.noFolder.map((collection) => (
                            <SortableCollectionItem
                              key={collection.id}
                              collection={collection}
                              folderId={null}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Bottom Action Buttons */}
          {session?.user?.id && (
            <div className="p-4 border-t border-[#2a2d35] bg-[#1a1d24]">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    if (pathname !== '/') {
                      router.push('/')
                      // Small delay to ensure navigation happens first
                      setTimeout(() => setShowCreateDialog(true), 100)
                    } else {
                      setShowCreateDialog(true)
                    }
                  }}
                  className="p-2 text-[#666] hover:text-[var(--accent-color)] hover:bg-[#2a2d35] rounded-full smooth-transition"
                  title="Create new collection"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowNewFolderInput(true)}
                  className="p-2 text-[#666] hover:text-[var(--accent-color)] hover:bg-[#2a2d35] rounded-full smooth-transition"
                  title="Create new folder"
                >
                  <FolderPlus className="h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push('/settings')}
                  className="p-2 text-[#666] hover:text-[var(--accent-color)] hover:bg-[#2a2d35] rounded-full smooth-transition"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Overall Progress */}
          {session?.user?.id && collections.length > 0 && showProgress && (
            <div className="p-4 border-t border-[#2a2d35] bg-[#1a1d24]">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#969696] font-medium">Overall Progress</span>
                  <span className="text-[#fafafa] font-semibold">
                    {ownedItems} / {totalItems}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2 bg-[#2a2d35]"
                />
                <div className="text-xs text-[#666] text-center">
                  {percentage}% complete
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

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

      <CreateCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          fetchCollections()
          setShowCreateDialog(false)
        }}
      />
    </>
  )
}
