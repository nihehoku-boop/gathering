/**
 * Request Deduplication Utility
 * Prevents duplicate API calls when multiple components request the same data simultaneously
 */

type PendingRequest<T> = {
  promise: Promise<T>
  timestamp: number
}

const pendingRequests = new Map<string, PendingRequest<any>>()
const REQUEST_TIMEOUT = 5000 // 5 seconds - requests older than this are considered stale

/**
 * Deduplicates requests by caching pending promises
 * If a request with the same key is already in progress, returns the existing promise
 * 
 * @param key - Unique identifier for the request (e.g., 'collections:userId123')
 * @param requestFn - Function that performs the actual request
 * @returns Promise that resolves to the request result
 */
export async function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  
  // Check if there's a pending request
  const pending = pendingRequests.get(key)
  
  if (pending) {
    // Check if the pending request is still valid (not stale)
    if (now - pending.timestamp < REQUEST_TIMEOUT) {
      // Return the existing promise
      return pending.promise
    } else {
      // Remove stale request
      pendingRequests.delete(key)
    }
  }
  
  // Create new request
  const promise = requestFn()
    .then((result) => {
      // Remove from pending after completion
      pendingRequests.delete(key)
      return result
    })
    .catch((error) => {
      // Remove from pending on error
      pendingRequests.delete(key)
      throw error
    })
  
  // Store pending request
  pendingRequests.set(key, {
    promise,
    timestamp: now,
  })
  
  return promise
}

/**
 * Clears all pending requests (useful for testing or cleanup)
 */
export function clearPendingRequests(): void {
  pendingRequests.clear()
}

/**
 * Gets the number of currently pending requests (useful for monitoring)
 */
export function getPendingRequestCount(): number {
  return pendingRequests.size
}

