// Service Worker for offline support and caching
const CACHE_NAME = 'gathering-v1'
const STATIC_CACHE = 'gathering-static-v1'
const IMAGE_CACHE = 'gathering-images-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/auth/signin',
  '/recommended',
  '/community',
  '/wishlist',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Cache install error:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external domains (except our API)
  if (!url.origin.includes(self.location.origin) && !url.pathname.startsWith('/api/')) {
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()
          
          // Cache successful responses (except auth endpoints)
          if (response.ok && !url.pathname.includes('/auth/')) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          
          return response
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline response
            return new Response(
              JSON.stringify({ error: 'Offline', offline: true }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          })
        })
    )
    return
  }

  // Handle image requests with cache-first strategy
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone()
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
      })
    )
    return
  }

  // Handle page requests with network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone()
        
        // Cache successful page responses
        if (response.ok) {
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
        }
        
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Return offline page
          return caches.match('/').then((offlinePage) => {
            return offlinePage || new Response('Offline', { status: 503 })
          })
        })
      })
  )
})

