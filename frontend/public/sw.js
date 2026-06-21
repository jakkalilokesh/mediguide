const CACHE_NAME = 'mediguide-v5';
const OFFLINE_URLS = [
    '/',
    '/index.html',
];

// Install — cache essential resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(OFFLINE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch — network-first for API, cache-first for static
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // API calls — network only (handled by backend offline fallback)
    if (url.pathname.startsWith('/api/')) return;

    // Static assets — cache-first
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    // Cache successful responses
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback — return cached index.html for navigation
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});
