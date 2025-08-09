
const CACHE = 'kegelpilot-pwa-v21';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/kegelpilot_192.png',
  './icons/kegelpilot_512.png',
  './assets/logo_text.png',
  './Logo.PNG',
  './art/soft-bg.svg',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  // Network-first for navigations (HTML) to avoid stale index
  if (e.request.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(e.request);
        const cache = await caches.open(CACHE);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match('./index.html');
        return cached || Response.error();
      }
    })());
    return;
  }
  // Cache-first for everything else
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
