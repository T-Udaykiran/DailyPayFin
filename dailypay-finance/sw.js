// DailyPay Finance - PWA Service Worker
const CACHE_NAME = 'dailypay-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './logo.png',
    './js/state.js',
    './js/router.js',
    './js/components/login.js',
    './js/components/admin-dashboard.js',
    './js/components/customer-mgmt.js',
    './js/components/loan-mgmt.js',
    './js/components/agent-dashboard.js',
    './js/components/customer-dashboard.js',
    './js/components/reports.js'
];

// Install Event
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets...');
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Clearing old caches...');
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Network-First Fallback-to-Cache Strategy for live data)
self.addEventListener('fetch', (e) => {
    // Avoid caching non-GET requests (such as analytics or CDN tools if needed)
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request);
        })
    );
});
