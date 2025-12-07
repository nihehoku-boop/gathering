/**
 * User data caching utility
 * Caches frequently accessed user data to reduce findUnique operations
 */

import { prisma } from './prisma'
import { serverCache, cacheKeys } from './server-cache'

interface CachedUser {
  id: string
  isAdmin: boolean
  isVerified: boolean
  isPrivate: boolean
  email: string
  name: string | null
  image: string | null
  badge: string | null
  accentColor: string | null
}

/**
 * Get user with caching (5 minute TTL for admin/verified status)
 * Use this for admin checks and user lookups
 */
export async function getCachedUser(userId: string): Promise<CachedUser | null> {
  const cacheKey = cacheKeys.user(userId)
  
  // Check cache first
  const cached = serverCache.get<CachedUser>(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isAdmin: true,
      isVerified: true,
      isPrivate: true,
      email: true,
      name: true,
      image: true,
      badge: true,
      accentColor: true,
    },
  })

  if (!user) {
    return null
  }

  // Cache for 5 minutes (admin/verified status rarely changes)
  serverCache.set(cacheKey, user, 5 * 60 * 1000)

  return user
}

/**
 * Check if user is admin (with caching)
 * This is the most common use case for user lookups
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await getCachedUser(userId)
  return user?.isAdmin || false
}

/**
 * Invalidate user cache (call when user data changes)
 */
export function invalidateUserCache(userId: string): void {
  serverCache.delete(cacheKeys.user(userId))
}

