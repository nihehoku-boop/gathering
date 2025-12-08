/**
 * Analytics Utility
 * 
 * Centralized analytics tracking for the application.
 * Uses Vercel Analytics for web analytics and custom events.
 * 
 * All tracking is privacy-friendly and GDPR compliant.
 */

import { track } from '@vercel/analytics'

export type AnalyticsEvent =
  | 'collection_created'
  | 'collection_updated'
  | 'collection_deleted'
  | 'collection_shared'
  | 'item_added'
  | 'item_updated'
  | 'item_deleted'
  | 'bulk_import_used'
  | 'community_collection_synced'
  | 'community_collection_viewed'
  | 'community_collection_upvoted'
  | 'wishlist_item_added'
  | 'wishlist_item_removed'
  | 'search_performed'
  | 'profile_viewed'
  | 'achievement_unlocked'
  | 'collection_exported'
  | 'collection_imported'
  | 'folder_created'
  | 'collection_reported'

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Track a custom analytics event
 * 
 * @param event - Event name
 * @param properties - Optional event properties
 * 
 * @example
 * trackEvent('collection_created', { category: 'comics', itemCount: 10 })
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
  try {
    // Only track in production
    if (process.env.NODE_ENV === 'production') {
      track(event, properties)
    } else {
      // Log in development for debugging
      console.log('[Analytics]', event, properties)
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.error('[Analytics] Error tracking event:', error)
  }
}

/**
 * Track page view (handled automatically by Vercel Analytics)
 * Use this for custom page views if needed
 */
export function trackPageView(path: string) {
  try {
    if (process.env.NODE_ENV === 'production') {
      track('page_view', { path })
    }
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error)
  }
}

/**
 * Track user action with context
 */
export function trackUserAction(
  action: string,
  context?: {
    userId?: string
    collectionId?: string
    itemId?: string
    [key: string]: string | number | boolean | null | undefined
  }
) {
  try {
    // Don't include user IDs in production for privacy
    const sanitizedContext = context
      ? Object.fromEntries(
          Object.entries(context).filter(([key]) => key !== 'userId')
        )
      : undefined

    if (process.env.NODE_ENV === 'production') {
      track(action, sanitizedContext)
    } else {
      console.log('[Analytics]', action, sanitizedContext)
    }
  } catch (error) {
    console.error('[Analytics] Error tracking user action:', error)
  }
}

