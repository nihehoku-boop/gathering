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
  }, [])

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/recommended-collections')
      if (res.ok) {
        const data = await res.json()
        setCollections(data)
        setFilteredCollections(data)
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

  const handleAddToAccount = async (collectionId: string) => {
    setAddingCollection(collectionId)
    try {
      const res = await fetch(`/api/recommended-collections/${collectionId}/add-to-account`, {
        method: 'POST',
      })

      if (res.ok) {
        showAlert({
          title: 'Success',
          message: 'Collection added to your account!',
          type: 'success',
          onConfirm: () => {
            router.push('/')
          },
        })
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-[#2a2d35] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-[var(--accent-color)] rounded-full animate-spin"></div>
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-4 border-4 border-[#2a2d35] rounded-full"></div>
            <div className="absolute inset-4 border-4 border-transparent border-r-[var(--accent-color)] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            
            {/* Center dot */}
            <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--accent-color)] rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-2">
            <p className="text-[#fafafa] text-lg font-medium">Loading recommended collections...</p>
            <div className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#969696]" />
            <Input
              type="text"
              placeholder="Search collections by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#2a2d35] border-[#353842] text-[#fafafa] placeholder:text-[#666] focus:border-[var(--accent-color)] smooth-transition"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-[#353842] text-[#fafafa] hover:bg-[#2a2d35] smooth-transition ${
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

        {(searchQuery || selectedCategory || selectedTags.length > 0) && (
          <p className="text-sm text-[#969696]">
            Showing {filteredCollections.length} of {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {collections.length === 0 ? (
        <Card className="bg-[#1a1d24] border-[#2a2d35]">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[#353842] mb-4" />
            <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
              No recommended collections available
            </h3>
            <p className="text-[#969696]">
              Check back later for curated collections!
            </p>
          </CardContent>
        </Card>
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
          {filteredCollections.map((collection, index) => (
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
                    className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                  />
                </div>
              )}
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-xl text-[#fafafa]">{collection.name}</CardTitle>
                {collection.category && (
                  <div className="mt-1">
                    <span className="text-xs text-[#969696] bg-[#2a2d35] px-2 py-1 rounded-full inline-block" title={collection.category}>
                      {collection.category}
                    </span>
                  </div>
                )}
                {collection.description && (
                  <CardDescription className="mt-2 text-[#969696] line-clamp-3">
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
                  <p className="text-sm text-[#969696]">
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

