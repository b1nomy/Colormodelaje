// Service worker: guarda la app en caché para usarla sin conexión.
// Sube CACHE_VERSION cuando cambies cualquier archivo de web/.
const CACHE_VERSION = "mezclador-v1";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./mezcla.js",
  "./app.js",
  "./data/pinturas.json",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE_VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cacheado) => {
      if (cacheado) return cacheado;
      return fetch(event.request).then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copia));
        }
        return respuesta;
      });
    })
  );
});
