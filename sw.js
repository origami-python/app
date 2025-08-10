const CACHE = 'socquiz-8bit-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  // こちらに ./assets/icon512.png を置く場合は、次行のコメントを外す
  // './assets/icon512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  const allow = [
    'https://cdnjs.cloudflare.com',
    'https://unpkg.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://ja.wikipedia.org',
    'https://commons.wikimedia.org'
  ];
  if (u.origin === location.origin || allow.some(d => u.origin.startsWith(d))) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        }).catch(()=>cached);
        return cached || fetchPromise;
      })
    );
  }
});