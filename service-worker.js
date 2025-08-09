
const CACHE = 'kegelpilot-pwa-v16';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/kegelpilot_192.png',
  './icons/kegelpilot_512.png',
  './art/card-level.svg',
  './art/card-edu.svg',
  './art/card-quick.svg',
  './assets/logo_text.png',
  './assets/instructor_placeholder.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
