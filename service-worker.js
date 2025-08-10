
const CACHE = 'kegelpilot-pwa-v32';
const PRECACHE = ['./','./index.html','./manifest.json','./icons/kegelpilot_192.png','./icons/kegelpilot_512.png','./Logo.PNG','./assets/logo_text.png','./art/card-level.svg','./art/card-edu.svg','./art/card-quick.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith((async()=>{try{const f=await fetch(e.request);const c=await caches.open(CACHE);c.put('./index.html',f.clone());return f;}catch(err){const cached=await caches.match('./index.html');return cached||Response.error();}})());return;} e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
