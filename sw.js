const CACHE_NAME = 'buscaminas-v2';

// Durante el desarrollo, mejor no cachear agresivamente para evitar errores
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Estrategia: Intentar red, si falla buscar en caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});