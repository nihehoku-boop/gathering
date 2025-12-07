/**
 * Server-side in-memory cache for database queries
 * Reduces Prisma operations significantly
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class ServerCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 30 * 1000 // 30 seconds
  private readonly MAX_SIZE = 1000 // Maximum cache entries

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Evict old entries if cache is too large
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictOldest()
    }

    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    })
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Delete all entries matching a pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Evict oldest entries (FIFO)
   */
  private evictOldest(): void {
    // Remove 10% of oldest entries
    const entriesToRemove = Math.floor(this.MAX_SIZE * 0.1)
    const sortedEntries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, entriesToRemove)

    for (const [key] of sortedEntries) {
      this.cache.delete(key)
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const serverCache = new ServerCache()

// Clean expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    serverCache.cleanExpired()
  }, 60 * 1000)
}

/**
 * Cache key generators
 * 
 * SECURITY NOTE: Cache keys don't include userId because:
 * 1. Collection IDs are globally unique (UUIDs)
 * 2. User ID is stored in cached data and validated on every cache hit
 * 3. If userId doesn't match, cache is skipped and fresh query is performed
 * 
 * This approach is secure because:
 * - Authorization is always validated (userId check)
 * - Cache is an optimization, not a security bypass
 * - Defense in depth: cache check + database query both validate ownership
 */
export const cacheKeys = {
  collection: (collectionId: string) => `collection:${collectionId}`,
  collectionItems: (collectionId: string, page: number, sortBy: string) => 
    `collection:${collectionId}:items:${page}:${sortBy}`,
  collectionOwnership: (collectionId: string, userId: string) => 
    `collection:${collectionId}:owner:${userId}`,
  userCollections: (userId: string) => `user:${userId}:collections`,
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
}

