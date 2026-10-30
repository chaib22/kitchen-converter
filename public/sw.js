/* Kitchen & Baking Converter — service worker
 * Strategy:
 *  - Navigations: network-first → cache fallback → /offline.html
 *  - Static assets (/_next/static, /icons, fonts): stale-while-revalidate
 *  - Everything else: network (passthrough)
 * Dev-safe: ignores hot-update requests and HMR pings.
 */
const VERSION = "kbc-v3";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Stale-while-revalidate for immutable static assets. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

/** Network-first for pages, falling back to cache then offline page. */
async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const staticCache = await caches.open(STATIC_CACHE);
    return (
      (await staticCache.match("/")) ||
      (await staticCache.match("/offline.html")) ||
      new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never interfere with dev HMR
  if (url.pathname.includes("hot-update") || url.pathname === "/_next/webpack-hmr") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?|ttf|css|js)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(staleWhileRevalidate(request));
  }
  // else: default network behaviour
});
