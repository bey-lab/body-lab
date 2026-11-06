// BODY-LAB offline app shell. No workout records or IndexedDB data are modified.
const CACHE_NAME = "body-lab-offline-v1";
const APP_FILES = [
  "./",
  "./index.html",
  "./training.html",
  "./records.html",
  "./tree.html",
  "./backup-test.html",
  "./storage-test.html",
  "./tree-test.html",
  "./manifest.webmanifest",
  "./js/navigation.js",
  "./js/db.js",
  "./js/training.js",
  "./js/day-watch.js",
  "./js/assistants.js",
  "./js/tree.js",
  "./js/coolness.js",
  "./js/backup.js",
  "./assets/characters/hinata.webp",
  "./assets/characters/sena.webp",
  "./assets/characters/mirei.webp",
  "./assets/branding/body-lab-logo.png",
  "./assets/icons/icon-180.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith("body-lab-offline-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  // Navigation checks online freshness but falls back to the offline app shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(
            new Request(url.origin + url.pathname), copy
          )).catch(() => {}));
        }
        return response;
      }).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(new Request(url.origin + url.pathname))) ||
               (await cache.match("./index.html")) ||
               Response.error();
      })
    );
    return;
  }

  // Cache-first for the precached application assets. A new SW version refreshes them.
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {}));
      }
      return response;
    }))
  );
});
