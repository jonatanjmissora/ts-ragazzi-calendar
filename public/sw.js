const CACHE = "ragazzi-v1"

self.addEventListener("install", () => {
	self.skipWaiting()
})

self.addEventListener("activate", (e) => {
	e.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (e) => {
	e.respondWith(
		caches.open(CACHE).then((cache) =>
			cache.match(e.request).then((cached) => {
				const fetchPromise = fetch(e.request)
					.then((res) => {
						cache.put(e.request, res.clone())
						return res
					})
				return cached || fetchPromise
			})
		)
	)
})
