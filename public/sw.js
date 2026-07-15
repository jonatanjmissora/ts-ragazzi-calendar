const CACHE_STATIC = "ragazzi-static"
const CACHE_PAGES = "ragazzi-pages-v1"
const CACHE_API = "ragazzi-api-v1"

const PRECACHE_URLS = [
	"/offline.html",
	"/manifest.json",
	"/logo192.png",
	"/logo512.png",
	"/favicon.ico",
]

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE_URLS))
	)
	self.skipWaiting()
})

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((key) => !key.startsWith("ragazzi-"))
					.map((key) => caches.delete(key))
			)
		)
	)
	self.clients.claim()
})

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting()
	}
})

self.addEventListener("fetch", (event) => {
	const { request } = event
	const url = new URL(request.url)

	if (request.method !== "GET") return
	if (!url.protocol.startsWith("http")) return

	// Ignorar requests internas de SSR a source files
	if (url.pathname.startsWith("/src/") || url.pathname.startsWith("/server/")) return

	// Server Functions: siempre a la red (nunca cacheadas por SW).
	// Las queries offline ya estan cubiertas por IndexedDB + queryFn fallback.
	if (url.pathname.startsWith("/_serverFn/")) return

	if (url.pathname.startsWith("/api/")) {
		event.respondWith(networkFirst(request, CACHE_API))
		return
	}

	if (request.mode === "navigate") {
		event.respondWith(networkFirstWithOffline(request))
		return
	}

	event.respondWith(networkFirst(request, CACHE_STATIC))
})

async function cacheFirst(request, cacheName) {
	const cache = await caches.open(cacheName)
	const cached = await cache.match(request)
	if (cached) return cached

	try {
		const response = await fetch(request)
		if (response.ok) {
			cache.put(request, response.clone())
		}
		return response
	} catch {
		return new Response("", { status: 408 })
	}
}

async function networkFirst(request, cacheName) {
	const cache = await caches.open(cacheName)
	try {
		const response = await fetch(request)
		if (response.ok) {
			cache.put(request, response.clone())
		}
		return response
	} catch {
		const cached = await cache.match(request)
		if (cached) return cached
		return new Response(JSON.stringify({ error: "offline" }), {
			status: 503,
			headers: { "Content-Type": "application/json" },
		})
	}
}

async function networkFirstWithOffline(request) {
	const cache = await caches.open(CACHE_PAGES)
	try {
		const response = await fetch(request)
		if (response.ok) {
			cache.put(request, response.clone())
		}
		return response
	} catch {
		const cached = await cache.match(request)
		if (cached) return cached

		const offlineCache = await caches.open(CACHE_STATIC)
		const offlinePage = await offlineCache.match("/offline.html")
		if (offlinePage) return offlinePage

		return new Response("Offline", { status: 503 })
	}
}
