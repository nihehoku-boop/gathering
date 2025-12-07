/**
 * Collection and Item Cache Manager
 * Stores data in localStorage to reduce database queries
 */

const CACHE_VERSION = '1.0'
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 10 * 1024 * 1024 // 10MB limit

interface CachedCollection {
  data: any
  timestamp: number
  version: string
}

interface CachedItems {
  items: any[]
  pagination: any
  timestamp: number
  version: string
}

export class CollectionCache {
  private static getCacheKey(collectionId: string, type: 'collection' | 'items'): string {
    return `collection_cache_${type}_${collectionId}_${CACHE_VERSION}`
  }

  private static getItemsPageKey(collectionId: string, page: number, sortBy: string): string {
    return `collection_cache_items_${collectionId}_${page}_${sortBy}_${CACHE_VERSION}`
  }

  private static isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_EXPIRY
  }

  private static getCacheSize(): number {
    let size = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('collection_cache_')) {
        size += (localStorage.getItem(key)?.length || 0)
      }
    }
    return size
  }

  private static evictOldCache(): void {
    // Remove expired cache entries
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('collection_cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}')
          if (this.isExpired(cached.timestamp)) {
            keysToRemove.push(key)
          }
        } catch {
          keysToRemove.push(key) // Remove invalid cache
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  // Cache collection metadata
  static setCollection(collectionId: string, data: any): void {
    try {
      this.evictOldCache()
      
      const cacheSize = this.getCacheSize()
      if (cacheSize > MAX_CACHE_SIZE) {
        // Clear oldest cache entries if we're over limit
        this.clearOldestCache()
      }

      const cached: CachedCollection = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      }
      localStorage.setItem(this.getCacheKey(collectionId, 'collection'), JSON.stringify(cached))
    } catch (error) {
      // If storage is full, clear and try again
      if (error instanceof DOMException && error.code === 22) {
        this.clearAllCache()
        try {
          const cached: CachedCollection = {
            data,
            timestamp: Date.now(),
            version: CACHE_VERSION,
          }
          localStorage.setItem(this.getCacheKey(collectionId, 'collection'), JSON.stringify(cached))
        } catch {
          // Storage still full, give up
        }
      }
    }
  }

  // Get collection metadata from cache
  static getCollection(collectionId: string): any | null {
    try {
      const cachedStr = localStorage.getItem(this.getCacheKey(collectionId, 'collection'))
      if (!cachedStr) return null

      const cached: CachedCollection = JSON.parse(cachedStr)
      
      // Check version
      if (cached.version !== CACHE_VERSION) {
        localStorage.removeItem(this.getCacheKey(collectionId, 'collection'))
        return null
      }

      // Check expiry
      if (this.isExpired(cached.timestamp)) {
        localStorage.removeItem(this.getCacheKey(collectionId, 'collection'))
        return null
      }

      return cached.data
    } catch {
      return null
    }
  }

  // Cache items page
  static setItemsPage(collectionId: string, page: number, sortBy: string, items: any[], pagination: any): void {
    try {
      this.evictOldCache()
      
      const cacheSize = this.getCacheSize()
      if (cacheSize > MAX_CACHE_SIZE) {
        this.clearOldestCache()
      }

      const cached: CachedItems = {
        items,
        pagination,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      }
      localStorage.setItem(this.getItemsPageKey(collectionId, page, sortBy), JSON.stringify(cached))
    } catch (error) {
      // If storage is full, clear and try again
      if (error instanceof DOMException && error.code === 22) {
        this.clearAllCache()
        try {
          const cached: CachedItems = {
            items,
            pagination,
            timestamp: Date.now(),
            version: CACHE_VERSION,
          }
          localStorage.setItem(this.getItemsPageKey(collectionId, page, sortBy), JSON.stringify(cached))
        } catch {
          // Storage still full, give up
        }
      }
    }
  }

  // Get items page from cache
  static getItemsPage(collectionId: string, page: number, sortBy: string): { items: any[]; pagination: any } | null {
    try {
      const cachedStr = localStorage.getItem(this.getItemsPageKey(collectionId, page, sortBy))
      if (!cachedStr) return null

      const cached: CachedItems = JSON.parse(cachedStr)
      
      // Check version
      if (cached.version !== CACHE_VERSION) {
        localStorage.removeItem(this.getItemsPageKey(collectionId, page, sortBy))
        return null
      }

      // Check expiry
      if (this.isExpired(cached.timestamp)) {
        localStorage.removeItem(this.getItemsPageKey(collectionId, page, sortBy))
        return null
      }

      return {
        items: cached.items,
        pagination: cached.pagination,
      }
    } catch {
      return null
    }
  }

  // Invalidate cache for a collection (when items are added/updated/deleted)
  static invalidateCollection(collectionId: string): void {
    // Remove collection metadata
    localStorage.removeItem(this.getCacheKey(collectionId, 'collection'))
    
    // Remove all item pages for this collection
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes(`_items_${collectionId}_`)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  // Clear oldest cache entries
  private static clearOldestCache(): void {
    const entries: Array<{ key: string; timestamp: number }> = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('collection_cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}')
          entries.push({ key: key, timestamp: cached.timestamp || 0 })
        } catch {
          // Remove invalid entries
          if (key) localStorage.removeItem(key)
        }
      }
    }

    // Sort by timestamp (oldest first) and remove oldest 20%
    entries.sort((a, b) => a.timestamp - b.timestamp)
    const toRemove = Math.ceil(entries.length * 0.2)
    entries.slice(0, toRemove).forEach(entry => {
      localStorage.removeItem(entry.key)
    })
  }

  // Get all cached pages for a collection (for restoring scroll position)
  static getAllCachedPages(collectionId: string, sortBy: string): Array<{ page: number; items: any[]; pagination: any }> {
    const cachedPages: Array<{ page: number; items: any[]; pagination: any }> = []
    
    try {
      // Check pages 1-20 (reasonable limit)
      for (let page = 1; page <= 20; page++) {
        const cached = this.getItemsPage(collectionId, page, sortBy)
        if (cached) {
          cachedPages.push({ page, ...cached })
        } else {
          // If we hit a missing page, stop (pages are sequential)
          break
        }
      }
    } catch {
      // Silently fail
    }
    
    return cachedPages.sort((a, b) => a.page - b.page)
  }

  // Clear all cache
  static clearAllCache(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('collection_cache_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}

