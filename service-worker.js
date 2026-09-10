// Service Worker de "Mis Finanzas"
// Objetivo: que la app (los 3 apartados, formularios y gráficas) cargue y funcione
// completa sin conexión, no solo que se vean datos guardados.
//
// Importante: sube este archivo junto a index.html, manifest.json e icon.svg,
// en la MISMA carpeta (la raíz de tu GitHub Pages), para que el registro
// "service-worker.js" (ruta relativa) lo encuentre.

const CACHE_VERSION = 'finanzas-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'
];

// INSTALL: descarga y guarda en caché todo lo necesario para abrir la app sin internet.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE: borra cachés de versiones viejas de la app.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// FETCH: caché primero (app instantánea y disponible offline); si no está en caché,
// se va a la red y esa copia se guarda para la próxima vez. Si no hay red y tampoco
// hay caché para una navegación, se regresa index.html (así nunca se queda en blanco
// ni se traba en un solo apartado).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
