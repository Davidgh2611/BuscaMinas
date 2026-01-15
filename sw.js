const CACHE_NAME = 'buscaminas-pro-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './js/main.js',
  'https://cdn-icons-png.flaticon.com/512/523/523050.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});