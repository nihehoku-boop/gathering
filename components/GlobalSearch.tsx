'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X, BookOpen, Package, Users, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchResult {
  collections: Array<{
    id: string
    name: string
    description: string | null
    category: string | null
    group: string | null
    coverImage: string | null
    itemCount: number
  }>
  items: Array<{
    id: string
    name: string
    number: number | null
    isOwned: boolean
    image: string | null
    collectionId: string
    collectionName: string
  }>
  communityCollections: Array<{
    id: string
    name: string
    description: string | null
    category: string | null
    coverImage: string | null
    itemCount: number
    upvotes: number
    user: {
      id: string
      name: string | null
      image: string | null
      badge: string | null
    }
  }>
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setLoading(true)
      fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          // Ensure all arrays exist
          setResults({
            collections: data.collections || [],
            items: data.items || [],
            communityCollections: data.communityCollections || [],
          })
          setShowResults(true)
        })
        .catch(err => {
          console.error('Search error:', err)
          setResults({
            collections: [],
            items: [],
            communityCollections: [],
          })
        })
        .finally(() => setLoading(false))
    } else {
      setResults(null)
      setShowResults(false)
    }
  }, [debouncedQuery])

  const handleResultClick = (type: 'collection' | 'item' | 'community', id: string) => {
    setShowResults(false)
    setQuery('')
    if (type === 'collection') {
      router.push(`/collections/${id}`)
    } else if (type === 'item') {
      // Find the item's collection ID from results
      const item = results?.items.find(i => i.id === id)
      if (item) {
        router.push(`/collections/${item.collectionId}`)
      }
    } else if (type === 'community') {
      router.push(`/community`)
    }
  }

  const totalResults = results
    ? (results.collections?.length || 0) + (results.items?.length || 0) + (results.communityCollections?.length || 0)
    : 0

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
        <Input
          type="text"
          placeholder="Search collections, items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results && totalResults > 0) {
              setShowResults(true)
            }
          }}
          className="pl-10 pr-10 bg-[var(--bg-tertiary)] border-[var(--border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] smooth-transition rounded-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults(null)
              setShowResults(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] smooth-transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && (loading || totalResults > 0) && (
        <div className="absolute top-full mt-2 w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[var(--text-secondary)]">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-4 text-center text-[var(--text-secondary)]">
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <div className="py-2">
              {results?.collections && results.collections.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Collections ({results.collections.length})
                  </div>
                  {results.collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleResultClick('collection', collection.id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-3"
                    >
                      {collection.coverImage ? (
                        <img
                          src={collection.coverImage}
                          alt={collection.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {collection.name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] truncate">
                          {collection.itemCount} items
                          {collection.group && ` • ${collection.group}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results?.items && results.items.length > 0 && (
                <div className="px-3 py-2 border-t border-[var(--border-color)]">
                  <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Items ({results.items.length})
                  </div>
                  {results.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick('item', item.id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-3"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {item.number && `#${item.number} `}
                          {item.name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] truncate">
                          {item.collectionName}
                          {item.isOwned && ' • ✓ Owned'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results?.communityCollections && results.communityCollections.length > 0 && (
                <div className="px-3 py-2 border-t border-[var(--border-color)]">
                  <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Community ({results.communityCollections.length})
                  </div>
                  {results.communityCollections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleResultClick('community', collection.id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-[var(--bg-tertiary)] smooth-transition flex items-center gap-3"
                    >
                      {collection.coverImage ? (
                        <img
                          src={collection.coverImage}
                          alt={collection.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded flex items-center justify-center">
                          <Users className="h-5 w-5 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {collection.name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] truncate">
                          {collection.itemCount} items • {collection.upvotes} upvotes
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

