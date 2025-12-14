const CACHE_NAME = 'iitmz-water-mgmt-v1';
const urlsToCache = [
  '/IITMZ_WDN/',
  '/IITMZ_WDN/index.html',
  '/IITMZ_WDN/app.html',
  '/IITMZ_WDN/admin.html',
  '/IITMZ_WDN/config.js',
  '/IITMZ_WDN/app.js',
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

// ✅ Handle Periodic Background Sync (runs even when app is closed)
// NOTIFICATIONS DISABLED: Background water level checking is running but notifications are commented out
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-water-levels') {
    event.waitUntil(checkWaterLevelsInBackground());
  }
});

// ✅ Background water level checking function
/* ====================================================================
   BACKGROUND WATER LEVEL CHECKING - NOTIFICATION PORTION DISABLED
   ====================================================================
   REASON: Push notifications disabled for testing/refinement
   
   DISABLED FEATURES:
   - self.registration.showNotification() call (line ~111)
   - Background alert sending to user
   
   FUNCTIONALITY STATUS:
   ✅ STILL ACTIVE: Water level fetching and threshold comparison
   ✅ STILL ACTIVE: Cooldown/repeating alert logic
   ✅ STILL ACTIVE: LocalStorage state management
   ❌ DISABLED: Showing notifications to user
   
   WHEN RE-ENABLING:
   1. Uncomment self.registration.showNotification() block
   2. Ensure service worker has notification permission
   3. Test background sync on Android device
   ====================================================================== */
async function checkWaterLevelsInBackground() {
  try {
    console.log('[SW] 🔄 Background sync: Checking water levels...');
    
    // Get config from IndexedDB or localStorage
    const configStr = localStorage.getItem('appConfig') || sessionStorage.getItem('appConfig');
    if (!configStr) {
      console.log('[SW] ⚠️ No config found, skipping background check');
      return;
    }

    const config = JSON.parse(configStr);
    const alertSettings = JSON.parse(localStorage.getItem('globalAlertSettings') || '{}');

    // Check all pages and sensors
    for (const [pageId, pageConfig] of Object.entries(config.pages || {})) {
      for (const [sensorId, sensorConfig] of Object.entries(pageConfig.sensors || {})) {
        try {
          // Fetch latest data from ThingSpeak
          const response = await fetch(
            `https://api.thingspeak.com/channels/${sensorConfig.channelID}/feeds.json?api_key=${sensorConfig.apiKey}&results=1`
          );
          
          if (!response.ok) continue;
          
          const data = await response.json();
          if (!data.feeds || !data.feeds[0]) continue;

          const rawValue = data.feeds[0][sensorConfig.field];
          if (rawValue === null || rawValue === undefined) continue;

          const currentLevel = parseFloat(rawValue);
          if (isNaN(currentLevel)) continue;

          // Check thresholds
          const sensorThresholds = alertSettings.thresholds?.[sensorId];
          if (!sensorThresholds) continue;

          let shouldAlert = false;
          let alertTitle = '';
          let alertMessage = '';

          if (sensorThresholds.min !== null && currentLevel < sensorThresholds.min) {
            shouldAlert = true;
            alertTitle = `⚠️ ${sensorId} CRITICAL LOW`;
            alertMessage = `Water level ${currentLevel} cm is below minimum ${sensorThresholds.min} cm`;
          } else if (sensorThresholds.max !== null && currentLevel > sensorThresholds.max) {
            shouldAlert = true;
            alertTitle = `⚠️ ${sensorId} CRITICAL HIGH`;
            alertMessage = `Water level ${currentLevel} cm exceeds maximum ${sensorThresholds.max} cm`;
          }

          if (shouldAlert) {
            // Check cooldown
            const lastAlertKey = `lastAlert_${sensorId}`;
            const lastAlertTime = parseInt(localStorage.getItem(lastAlertKey) || 0);
            const now = Date.now();
            const isRepeatingEnabled = alertSettings.enabledRepeating?.[sensorId];
            const cooldownTime = isRepeatingEnabled ? 300000 : Infinity;

            if (now - lastAlertTime >= cooldownTime) {
              // NOTIFICATION DISABLED: Send notification (COMMENTED OUT)
              /*
              self.registration.showNotification(alertTitle, {
                body: alertMessage,
                icon: '/IITMZ_WDN/IITMZ_Logo_192.png',
                badge: '/IITMZ_WDN/IITMZ_Logo.ico',
                tag: `alert-${sensorId}`,
                requireInteraction: true
              });
              */
              
              // Log instead of notifying (for debugging)
              console.warn(`[SW] Threshold breach (notifications disabled): ${alertTitle} - ${alertMessage}`);

              localStorage.setItem(lastAlertKey, now.toString());
              console.log(`[SW] ⚠️ Alert detected (not shown): ${alertTitle}`);
            }
          }
        } catch (error) {
          console.error(`[SW] Error checking sensor ${sensorId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

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
