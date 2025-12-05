'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Search, Edit, Trash2, User, List, Filter as FilterIcon, X, ChevronDown, ChevronUp, Heart, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { parseTags, getTagColor, AVAILABLE_TAGS } from '@/lib/tags'
import CreateCommunityCollectionDialog from './CreateCommunityCollectionDialog'
import EditCommunityCollectionDialog from './EditCommunityCollectionDialog'
import { getBadgeEmoji } from '@/lib/badges'
import AlertDialog from './ui/alert-dialog'
import { useAlert } from '@/hooks/useAlert'
import CollectionCardSkeleton from './CollectionCardSkeleton'

interface CommunityItem {
  id: string
  name: string
  number: number | null
}

interface CommunityCollection {
  id: string
  name: string
  description: string | null
  category: string | null
  coverImage: string | null
  coverImageFit?: string | null
  tags: string
  items: CommunityItem[]
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    badge: string | null
    isVerified: boolean
  }
  createdAt: string
  upvotes?: number
  score?: number
  userVote?: 'upvote' | null
}

export default function CommunityCollectionsList() {
  const router = useRouter()
  const { data: session } = useSession()
  const [collections, setCollections] = useState<CommunityCollection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<CommunityCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [addingCollection, setAddingCollection] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('') // Immediate input value
  const [searchQuery, setSearchQuery] = useState('') // Debounced search query
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostItems' | 'leastItems' | 'alphabetical' | 'popular'>('newest')
  const [votingCollectionId, setVotingCollectionId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { alertDialog, showAlert, showConfirm, closeAlert } = useAlert()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCollection, setEditingCollection] = useState<CommunityCollection | null>(null)
  const [managingCollectionId, setManagingCollectionId] = useState<string | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    // Reset and fetch first page when filters/search/sort change
    setCurrentPage(1)
    setCollections([])
    setHasMore(true)
    fetchCollections(1, false)
    
    // Listen for updates when collections are created/updated
    const handleUpdate = () => {
      console.log('[CommunityCollectionsList] Received update event, refreshing...')
      setCurrentPage(1)
      setCollections([])
      setHasMore(true)
      fetchCollections(1, false)
    }
    
    window.addEventListener('communityCollectionsUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('communityCollectionsUpdated', handleUpdate)
    }
  }, [sortBy, searchQuery, selectedCategory, selectedTags])

  const handleVote = async (collectionId: string) => {
    if (!session) {
      showAlert({
        title: 'Sign In Required',
        message: 'Please sign in to vote on collections.',
        type: 'info',
      })
      return
    }

    setVotingCollectionId(collectionId)
    try {
      const res = await fetch(`/api/community-collections/${collectionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: 'upvote' }),
      })

      if (res.ok) {
        const data = await res.json()
        // Update the collection in state
        setCollections(prev => prev.map(c => 
          c.id === collectionId 
            ? { ...c, upvotes: data.upvotes, score: data.score, userVote: data.userVote }
            : c
        ))
        setFilteredCollections(prev => prev.map(c => 
          c.id === collectionId 
            ? { ...c, upvotes: data.upvotes, score: data.score, userVote: data.userVote }
            : c
        ))
        } else {
          const error = await res.json()
          showAlert({
            title: 'Error',
            message: error.error || 'Failed to vote',
            type: 'error',
          })
        }
      } catch (error) {
        console.error('Error voting:', error)
        showAlert({
          title: 'Error',
          message: 'Failed to vote',
          type: 'error',
        })
      } finally {
      setVotingCollectionId(null)
    }
  }

  // Since filtering is now done server-side, we just use the collections directly
  useEffect(() => {
    setFilteredCollections(collections)
  }, [collections])

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

  const fetchCollections = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    
    try {
      console.log(`[CommunityCollectionsList] Fetching collections page ${page}...`)
      const startTime = performance.now()
      
      // Build query parameters
      const params = new URLSearchParams({
        sortBy: sortBy,
        page: page.toString(),
        limit: '20',
      })
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }
      
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','))
      }
      
      const res = await fetch(`/api/community-collections?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const endTime = performance.now()
      console.log(`[CommunityCollectionsList] Fetch completed in ${(endTime - startTime).toFixed(2)}ms`)
      if (res.ok) {
        const data = await res.json()
        if (append) {
          setCollections(prev => [...prev, ...data.collections])
        } else {
          setCollections(data.collections)
        }
        setHasMore(data.pagination.hasMore)
        setCurrentPage(page)
        setTotalCount(data.pagination.total || 0)
      }
    } catch (error) {
      console.error('Error fetching community collections:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCollections(currentPage + 1, true)
    }
  }

  const handleAddToAccount = async (collectionId: string) => {
    setAddingCollection(collectionId)
    try {
      const res = await fetch(`/api/community-collections/${collectionId}/add-to-account`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        const newlyUnlocked = data.newlyUnlockedAchievements || []
        
        if (newlyUnlocked.length > 0) {
          showAlert({
            title: 'Collection Added! 🎉',
            message: `You unlocked ${newlyUnlocked.length} achievement${newlyUnlocked.length > 1 ? 's' : ''}!`,
            type: 'success',
            onConfirm: () => {
              router.push('/')
            },
          })
        } else {
          showAlert({
            title: 'Success',
            message: 'Collection added to your account!',
            type: 'success',
            onConfirm: () => {
              router.push('/')
            },
          })
        }
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

  const handleDelete = async (collectionId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Collection',
      message: 'Are you sure you want to delete this community collection? This action cannot be undone.',
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/community-collections/${collectionId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCollections()
        showAlert({
          title: 'Success',
          message: 'Collection deleted successfully.',
          type: 'success',
        })
      } else {
        const error = await res.json()
        showAlert({
          title: 'Error',
          message: error.error || 'Failed to delete collection',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      showAlert({
        title: 'Error',
        message: 'Failed to delete collection',
        type: 'error',
      })
    }
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696] z-10" />
            <Input
              type="text"
              placeholder="Search collections by name, description, category, or creator..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10 bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
            />
            {searchInput && searchInput !== searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-[#666] border-t-transparent rounded-full animate-spin"></span>
              </div>
            )}
            {searchInput && searchInput === searchQuery && loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-[#666] border-t-transparent rounded-full animate-spin"></span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition ${
              (selectedCategory || selectedTags.length > 0) ? 'border-[var(--accent-color)]' : ''
            }`}
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            Filters
            {(selectedCategory || selectedTags.length > 0) && (
              <span className="ml-2 px-1.5 py-0.5 bg-[var(--accent-color)] text-white rounded-full text-xs">
                {[selectedCategory && '1', selectedTags.length > 0 && selectedTags.length].filter(Boolean).join('+')}
              </span>
            )}
          </Button>
          {session && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="accent-button text-white smooth-transition"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
          )}
        </div>

        {showFilters && (
          <Card className="bg-[#1a1d24] border-[#2a2d35] p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#fafafa]">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('')
                    setSelectedTags([])
                  }}
                  className="text-xs text-[#969696] hover:text-[#fafafa]"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#969696]">Category</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#2a2d35] border border-[#353842] text-[#fafafa] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none appearance-none"
                    >
                      <option value="">All Categories</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696] pointer-events-none" />
                  </div>
                </div>

                {/* Tag Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#969696]">Tags</label>
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
                  <label className="text-xs font-medium text-[#969696]">Sort By</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-[#2a2d35] border border-[#353842] text-[#fafafa] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-color)] focus:outline-none appearance-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="mostItems">Most Items</option>
                      <option value="leastItems">Least Items</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696] pointer-events-none" />
                  </div>
                </div>
              </div>

              {(selectedCategory || selectedTags.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2a2d35]">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2a2d35] text-[#fafafa] rounded-full text-xs">
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

        <p className="text-sm text-[#969696]">
          {filteredCollections.length} out of {totalCount} community collection{totalCount !== 1 ? 's' : ''}
          {(searchQuery || selectedCategory || selectedTags.length > 0) && ' (filtered)'}
          {hasMore && ` - more available, click "Load More" to see more`}
        </p>
      </div>

      {loading && collections.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <Card className="bg-[#1a1d24] border-[#2a2d35]">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[#353842] mb-4" />
            <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
              No community collections available
            </h3>
            <p className="text-[#969696]">
              {session ? 'Be the first to create a community collection!' : 'Check back later for community collections!'}
            </p>
          </CardContent>
        </Card>
      ) : loading && filteredCollections.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCollections.length === 0 ? (
        <Card className="bg-[#1a1d24] border-[#2a2d35]">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-[#353842] mb-4" />
            <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
              No collections found
            </h3>
            <p className="text-[#969696]">
              Try adjusting your search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection, index) => {
            const isOwner = session?.user?.id === collection.userId

            return (
              <Card 
                key={collection.id} 
                className="bg-[#1a1d24] border-[#2a2d35] hover:border-[#353842] hover-lift cursor-pointer overflow-hidden smooth-transition group relative flex flex-col h-full animate-fade-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {collection.coverImage && (
                  <div className="w-full h-48 overflow-hidden bg-[#2a2d35] flex-shrink-0">
                    <img
                      src={collection.coverImage}
                      alt={collection.name}
                      className={`w-full h-full ${collection.coverImageFit === 'contain' ? 'object-contain' : 'object-cover'} group-hover:scale-105 smooth-transition`}
                    />
                  </div>
                )}
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-xl text-[#fafafa]">{collection.name}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-[#969696] mb-2">
                    <User className="h-3 w-3" />
                    <span className="flex items-center gap-1">
                      {collection.user.badge && (
                        <span className="text-sm">{getBadgeEmoji(collection.user.badge) || collection.user.badge}</span>
                      )}
                      {collection.user.name || collection.user.email}
                      {collection.user.isVerified && (
                        <span title="Verified account">
                          <CheckCircle2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        </span>
                      )}
                    </span>
                  </div>
                  {collection.category && (
                    <div className="mt-1">
                      <span className="text-xs text-[#969696] bg-[#2a2d35] px-2 py-1 rounded-full inline-block" title={collection.category}>
                        {collection.category}
                      </span>
                    </div>
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
                  {collection.description && (
                    <CardDescription className="mt-2 text-[#969696] line-clamp-3">
                      {collection.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#969696]">
                        {collection.items.length} items included
                      </p>
                      {/* Voting UI - Upvote only */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVote(collection.id)
                          }}
                          disabled={votingCollectionId === collection.id || !session}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg smooth-transition border ${
                            collection.userVote === 'upvote'
                              ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]'
                              : 'bg-[#2a2d35] text-[#969696] border-[#353842] hover:text-[#fafafa] hover:bg-[#353842]'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="Upvote"
                        >
                          <Heart className={`h-4 w-4 ${collection.userVote === 'upvote' ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">
                            {collection.upvotes !== undefined ? collection.upvotes : 0}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      {isOwner && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCollection(collection)
                            }}
                            className="border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(collection.id)
                            }}
                            className="border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/10 smooth-transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {session && (
                        <div className="flex-1 flex justify-end">
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && filteredCollections.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            className="accent-button text-white smooth-transition"
            size="lg"
          >
            {loadingMore ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      <CreateCommunityCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setCurrentPage(1)
          setCollections([])
          setHasMore(true)
          fetchCollections(1, false)
        }}
      />
      <EditCommunityCollectionDialog
        open={editingCollection !== null}
        onOpenChange={(open) => !open && setEditingCollection(null)}
        collection={editingCollection}
        onSuccess={() => {
          setCurrentPage(1)
          setCollections([])
          setHasMore(true)
          fetchCollections(1, false)
        }}
      />
      {managingCollectionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] bg-[#1a1d24] border-[#2a2d35]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#fafafa]">Manage Items</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setManagingCollectionId(null)}
                  className="text-[#969696] hover:text-[#fafafa]"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#969696]">
                Item management for community collections will be available soon. 
                For now, you can edit the collection details or delete and recreate it with items.
              </p>
            </CardContent>
          </Card>
        </div>
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
    </div>
  )
}

