import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getRateLimitIdentifier, RateLimitOptions } from './rate-limit'

export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: RateLimitOptions,
  getUserId?: (request: NextRequest) => Promise<string | undefined>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Get user ID if available
      const userId = getUserId ? await getUserId(request) : undefined
      
      // Get identifier for rate limiting
      const identifier = getRateLimitIdentifier(request, userId)
      
      // Check rate limit
      const result = rateLimit(identifier, options)
      
      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(result.retryAfter),
              'X-RateLimit-Limit': String(options.maxRequests),
              'X-RateLimit-Remaining': String(result.remaining),
              'X-RateLimit-Reset': String(result.resetTime),
            },
          }
        )
      }
      
      // Add rate limit headers to response
      const response = await handler(request, ...args)
      
      // Add rate limit info to response headers
      response.headers.set('X-RateLimit-Limit', String(options.maxRequests))
      response.headers.set('X-RateLimit-Remaining', String(result.remaining))
      response.headers.set('X-RateLimit-Reset', String(result.resetTime))
      
      return response
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      // If rate limiting fails, allow the request (fail open)
      return handler(request, ...args)
    }
  }
}

