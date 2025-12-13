const CACHE_NAME = 'iitmz-water-mgmt-v1';
const urlsToCache = [
  '/IITMZ_WDN/',
  '/IITMZ_WDN/index.html',
  '/IITMZ_WDN/reservoir.html',
  '/IITMZ_WDN/overhead-tank.html',
  '/IITMZ_WDN/translation-manager.js',
  '/IITMZ_WDN/IITMZ.jpg',
  '/IITMZ_WDN/IITMZ_Logo.ico',
  '/IITMZ_WDN/IITMZ_Logo_192.png',
  '/IITMZ_WDN/IITMZ_Logo_512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network first for API calls
  if (event.request.url.includes('thingspeak.com') || event.request.url.includes('googleapis.com') || event.request.url.includes('gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloneResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloneResponse));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for other assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const cloneResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloneResponse));
          return response;
        });
      }).catch(() => {
        // Return offline page if available
        return new Response('Offline - cached data may not be current', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
    );
  }
});
