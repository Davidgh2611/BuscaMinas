const CACHE_NAME = 'buscaminas-v1';
// Solo incluimos lo estrictamente necesario y verificado
const assets = [
  './',
  './index.html',
  './style.css',      // Revisa si está en la raíz o en carpeta /css
  './js/main.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Usamos addAll pero con un catch para ver qué archivo falla
      return cache.addAll(assets).catch(err => console.error("Fallo en cache:", err));
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});