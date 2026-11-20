const CACHE = "mahjong-v2";
const FILES = ["./", "./index.html", "./manifest.json"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Network-first strategy: always try to get latest from network
  e.respondWith(
    fetch(e.request).then(resp => {
      const cp = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
      return resp;
    }).catch(() => {
      return caches.match(e.request).then(cached => cached || new Response("Offline", { status: 503 }));
    })
  );
});