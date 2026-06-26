# TanStack Start + PWA + Offline — Guia Completa

## El Problema

`vite-plugin-pwa` **no funciona** con TanStack Start + Nitro en production builds.

**Causa raiz:** TanStack Start/Vinxi setea `ssr: true` en ambos builds (client y server).
`vite-plugin-pwa` necesita `ssr: false` para generar el service worker, pero TanStack Start nunca lo tiene.

```
// TanStack Start build:
ssr=true outDir=dist/        ← client build, pero SSR=true
ssr=true outDir=dist/server/ ← server build

// vite-plugin-pwa check:
if (!viteConfig.build.ssr) generateSW()  ← NUNCA se ejecuta
```

**Issues de referencia:**
- https://github.com/TanStack/router/issues/4988
- https://github.com/vite-pwa/vite-plugin-pwa/issues/902
- https://github.com/TanStack/router/discussions/4770

## La Solucion

SW manual con runtime caching. Sin dependencias de Workbox ni vite-plugin-pwa.

### Por que manual?

1. `vite-plugin-pwa` no genera `sw.js` con TanStack Start
2. Serwist (fork de vite-plugin-pwa) tiene el mismo problema
3. Un post-build script con `workbox-build` es otra opcion, pero agrega complejidad
4. El SW manual es simple, no tiene dependencias, y Nitro sirve `public/` directo

## Archivos a Crear/Modificar

### 1. `public/sw.js` — Service Worker

Nitro copia `public/` a `.output/public/` en el build. El SW va en `public/` y se sirve automaticamente.

```js
const CACHE_NAME = "app-v1"
const STATIC_CACHE = "app-static-v1"

self.addEventListener("install", (event) => {
	self.skipWaiting()
})

self.addEventListener("activate", (event) => {
	event.waitUntil(
		Promise.all([
			self.clients.claim(),
			caches.keys().then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== STATIC_CACHE && key !== CACHE_NAME)
						.map((key) => caches.delete(key))
				)
			),
		])
	)
})

self.addEventListener("fetch", (event) => {
	const { request } = event

	// Solo GET
	if (request.method !== "GET") return

	const url = new URL(request.url)

	// API: network-first con fallback a cache
	if (url.pathname.startsWith("/api/")) {
		event.respondWith(
			fetch(request).catch(() => caches.match(request))
		)
		return
	}

	// Assets estaticos: stale-while-revalidate
	if (
		url.pathname.endsWith(".js") ||
		url.pathname.endsWith(".css") ||
		url.pathname.endsWith(".png") ||
		url.pathname.endsWith(".jpg") ||
		url.pathname.endsWith(".svg") ||
		url.pathname.endsWith(".ico") ||
		url.pathname.endsWith(".woff2")
	) {
		event.respondWith(
			caches.open(STATIC_CACHE).then((cache) =>
				cache.match(request).then((cached) => {
					const fetched = fetch(request).then((response) => {
						if (response.ok) {
							cache.put(request, response.clone())
						}
						return response
					})
					return cached || fetched
				})
			)
		)
		return
	}

	// Navegacion y otros: network-first con fallback a cache
	event.respondWith(
		fetch(request)
			.then((response) => {
				if (response.ok) {
					const clone = response.clone()
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
				}
				return response
			})
			.catch(() => caches.match(request))
	)
})
```

**Estrategias de cache:**
| Tipo | Estrategia | Cache |
|------|-----------|-------|
| API (`/api/`) | Network-first | Fallback a cache si offline |
| Assets (`.js`, `.css`, `.png`...) | Stale-while-revalidate | Sirve cache, actualiza en background |
| Navegacion | Network-first | Sirve cache si offline |

### 2. `public/manifest.webmanifest` — PWA Manifest

```json
{
	"name": "Tu App",
	"short_name": "TuApp",
	"description": "Descripcion de tu app",
	"start_url": "/",
	"display": "standalone",
	"background_color": "#09090b",
	"theme_color": "#09090b",
	"orientation": "portrait-primary",
	"icons": [
		{ "src": "/logo192.png", "sizes": "192x192", "type": "image/png" },
		{ "src": "/logo512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
	],
	"screenshots": [
		{ "src": "/screenshot-mobile.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" },
		{ "src": "/screenshot-wide.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" }
	]
}
```

**Requisitos en `public/`:**
- `logo192.png` (192x192)
- `logo512.png` (512x512)
- `screenshot-mobile.png` (390x844)
- `screenshot-wide.png` (1280x720)

### 3. `src/components/pwa-register.tsx` — Registro del SW

```tsx
"use client"

import { useEffect, useState } from "react"

export function PWARegister() {
	const [needRefresh, setNeedRefresh] = useState(false)
	const [offlineReady, setOfflineReady] = useState(false)

	useEffect(() => {
		if (import.meta.env.DEV || !("serviceWorker" in navigator)) return

		let registration: ServiceWorkerRegistration | undefined

		navigator.serviceWorker.register("/sw.js").then((reg) => {
			registration = reg

			if (reg.waiting) {
				setNeedRefresh(true)
			}

			reg.addEventListener("updatefound", () => {
				const newWorker = reg.installing
				if (!newWorker) return

				newWorker.addEventListener("statechange", () => {
					if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
						setNeedRefresh(true)
					} else if (newWorker.state === "activated") {
						setOfflineReady(true)
						setTimeout(() => setOfflineReady(false), 5000)
					}
				})
			})
		})

		navigator.serviceWorker.addEventListener("controllerchange", () => {
			window.location.reload()
		})

		return () => {
			registration?.unregister()
		}
	}, [])

	useEffect(() => {
		if (import.meta.env.DEV) {
			setNeedRefresh(false)
			setOfflineReady(false)
		}
	}, [])

	if (import.meta.env.DEV) return null

	const updateSW = () => {
		navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" })
	}

	return (
		<>
			{offlineReady && (
				<div className="fixed bottom-4 right-4 z-50 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
					App lista para uso offline
				</div>
			)}
			{needRefresh && (
				<div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
					<span>Nueva version disponible</span>
					<button
						onClick={updateSW}
						className="rounded bg-blue-600 px-3 py-1 text-xs font-medium hover:bg-blue-500"
					>
						Actualizar
					</button>
					<button
						onClick={() => setNeedRefresh(false)}
						className="text-xs text-zinc-400 hover:text-white"
					>
						Cerrar
					</button>
				</div>
			)}
		</>
	)
}
```

### 4. `src/routes/__root.tsx` — Importar el componente

En el `head()` de la root route, agregar el link al manifest:

```tsx
links: [
	{
		rel: "stylesheet",
		href: appCss,
	},
	{
		rel: "manifest",
		href: "/manifest.webmanifest",
	},
],
```

En el `RootDocument`, agregar el componente en el `<body>`:

```tsx
import { PWARegister } from "@/components/pwa-register"

// ...

<body className="w-full h-full flex flex-col">
	{children}
	<PWARegister />
	<Toaster />
	<Scripts />
</body>
```

### 5. `vite.config.ts` — Sin cambios necesarios

El `vite.config.ts` NO necesita ningun plugin de PWA. Solo TanStack Start + Nitro:

```ts
import { nitro } from "nitro/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"

plugins: [
	nitro(),
	tanstackStart(),
	// ... otros plugins (tailwindcss, etc)
],
```

**NO instalar:**
- `vite-plugin-pwa` (no funciona con TanStack Start)
- `@serwist/vite` (mismo problema)
- `workbox-build` (innecesario sin precaching estatico)

## Que No Hace Este Setup

- **No precachea assets con hashes** — los assets se cachean al primer fetch (runtime caching)
- **No tiene generacion automatica de manifest** — es un JSON manual en `public/`
- **No tiene workbox** — el SW es vanilla JS sin dependencias

Si necesitas precaching estatico (offline-first total), la alternativa es un **post-build script** con `workbox-build` que genere el `sw.js` despues de `vite build`. Ver seccion Alternativas.

## Build y Preview

```bash
pnpm build && pnpm preview
```

**Verificar en DevTools:**
1. Application → Service Workers: debe mostrar "activated and is running"
2. Application → Manifest: debe mostrar los datos del app
3. Network: `/sw.js` debe retornar 200
4. Offline (Application → Service Workers → Offline): la app debe seguir funcionando

## Versionado de Cache

Para forzar actualizaciones del SW, cambiar el `CACHE_NAME` en `sw.js`:

```js
const CACHE_NAME = "app-v2"  // cambiar version
```

El SW con `skipWaiting()` + `clientsClaim()` se activa inmediatamente y limpia caches viejos.

## Alternativas

### Post-Build con Workbox (precache estatico)

Si se necesita precaching de assets con hashes:

1. Instalar `workbox-build`
2. Crear `scripts/generate-sw.ts` que use `generateSW()` de workbox-build
3. Output a `.output/public/sw.js` (para Nitro)
4. Agregar `"build:sw": "tsx scripts/generate-sw.ts"` a package.json
5. Modificar build script: `"build": "pnpm build:sw && vite build"`

```ts
// scripts/generate-sw.ts
import { generateSW } from "workbox-build"
import { resolve } from "path"

const outDir = resolve(".output/public")

generateSW({
	globDirectory: outDir,
	globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
	swDest: resolve(outDir, "sw.js"),
	navigateFallback: "/",
	navigateFallbackDenylist: [/^\/api\//],
	skipWaiting: true,
	clientsClaim: true,
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/.*\/api\/.*/i,
			handler: "NetworkFirst",
			options: {
				cacheName: "api-cache",
				expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
			},
		},
	],
})
```

### Serwist

Serwist es un fork de Workbox optimizado para frameworks modernos. Tiene soporte experimental para TanStack Start pero con el mismo problema de build. Se puede usar con un approach similar al post-build script.

## Debugging

### "is redundant" en DevTools

El SW se registro pero el browser lo descarto como innecesario. Causas:
- El SW anterior ya esta activo y controlando la pagina
- El SW no se activo correctamente

**Fix:** Asegurar `skipWaiting()` en install y `clientsClaim()` en activate.

### "Invalid or unexpected token" en sw.js

El archivo `sw.js` esta corrupto. Causas comunes:
- `vite-plugin-pwa` genero el SW con `globDirectory` incorrecto
- El SW se genero en `dist/` pero Nitro sirve desde `.output/public/`

**Fix:** Usar el SW manual (este setup).

### sw.js 404 en preview

El `sw.js` no esta en `.output/public/`. Causa:
- El SW esta en `public/` pero Nitro no lo copio

**Fix:** Verificar que `public/sw.js` existe antes del build. Nitro copia todo `public/` a `.output/public/`.

### SW no se activa en dev

El componente `PWARegister` tiene `if (import.meta.env.DEV) return null`. Esto es intencional — el SW solo se registra en production.

Para probar en dev, temporalmente remover ese check.
