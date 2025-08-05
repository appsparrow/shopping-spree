const CACHE_NAME = 'shopping-tracker-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('Service Worker installing with cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, adding URLs:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache install failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - Cache first for static assets, network first for API calls
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  const url = new URL(event.request.url);
  
  // For the root path or static assets, use cache-first strategy
  if (url.pathname === '/' || 
      url.pathname.includes('.js') || 
      url.pathname.includes('.css') || 
      url.pathname.includes('.png') || 
      url.pathname.includes('.jpg') || 
      url.pathname.includes('.svg') ||
      url.pathname.includes('.ico')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached version if available
          if (response) {
            console.log('Serving from cache:', event.request.url);
            return response;
          }
          
          // Otherwise fetch from network and cache it
          return fetch(event.request).then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
        })
        .catch(() => {
          // If it's a navigation request and we're offline, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          
          return new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        })
    );
  } else {
    // For API calls, use network-first strategy
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Optionally cache API responses for offline use
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Try to serve from cache if network fails
          return caches.match(event.request)
            .then(response => {
              if (response) {
                console.log('Serving API response from cache:', event.request.url);
                return response;
              }
              throw new Error('No cached response available');
            });
        })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'shopping-items-sync') {
    console.log('Background sync triggered for shopping items');
    event.waitUntil(
      // Show notification that sync completed
      self.registration.showNotification('Shopping Tracker', {
        body: 'Your offline changes have been synced!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sync-complete'
      })
    );
  }
});

// Listen for messages from the main app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
