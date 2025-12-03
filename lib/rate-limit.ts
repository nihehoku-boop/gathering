// Simple in-memory rate limiter
// For production with high traffic, consider using Redis

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number // Seconds until retry is allowed
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { windowMs, maxRequests } = options
  const now = Date.now()
  const key = identifier

  // Get or create entry
  let entry = store[key]

  // If entry doesn't exist or has expired, create new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    }
    store[key] = entry
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

// Helper to get identifier from request (IP address or user ID)
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  // If user is authenticated, use user ID (more accurate)
  if (userId) {
    return `user:${userId}`
  }
  
  // Otherwise, use IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  return `ip:${ip}`
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  },
  // Moderate limits for write operations
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  // Lenient limits for read operations
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  // Very strict for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 requests per hour
  },
  // Strict for registration
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 registrations per hour per IP
  },
}

