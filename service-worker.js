"use strict";

const APP_VERSION = "2.0.2";
const CACHE_VERSION = `kho-khuon-be-cache-${APP_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  `./style.css?v=${APP_VERSION}`,
  `./app-config.js?v=${APP_VERSION}`,
  `./supabase-adapter.js?v=${APP_VERSION}`,
  `./script.js?v=${APP_VERSION}`,
  `./manifest.json?v=${APP_VERSION}`,
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith(".sql")) return;

  const isNavigation = request.mode === "navigate" || request.destination === "document";
  const isRuntimeConfig = url.pathname.endsWith("/app-config.js");

  if (isNavigation || isRuntimeConfig) {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request, fallbackPath) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response && response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match(fallbackPath);
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkPromise || new Response("Offline", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
