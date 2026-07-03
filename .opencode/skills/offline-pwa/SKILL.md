---
name: offline-pwa
description: "Use when implementing offline support, PWA, service workers, IndexedDB mutation queues, sync indicators, or offline-first data persistence in a React / TanStack app. Contains the full battle-tested pattern derived from ts-ragazzi-calendar."
---

# /offline-pwa

Implementación offline + PWA para apps React con TanStack Start/Router + React Query.  
Patrón extraído de producción: Service Worker manual, IndexedDB con `idb`, cola de mutaciones, cache de lectura, indicador de estado y auto-sync al reconectarse.

## Cuándo usar este skill

- Cuando el usuario pide soporte offline, modo sin conexión, o PWA.
- Cuando se habla de IndexedDB, mutation queue, sync al reconectarse.
- Cuando hay que implementar `OfflineIndicator`, `useOnlineStatus`, o `processMutationQueue`.
- Cuando hay que decidir entre vite-plugin-pwa/Workbox vs SW manual.

---

## Stack requerido

| Paquete | Rol |
|---------|-----|
| `idb` ^8 | Wrapper tipado de IndexedDB |
| `@tanstack/react-query` v5 | Estado del servidor + cache en memoria |
| Service Worker nativo | Cache de assets y páginas |
| `useSyncExternalStore` (React 18+) | Hook de estado de red |

**Solo dependencia nueva:** `pnpm add idb`  
No se usa `vite-plugin-pwa` ni Workbox — el SW es manual para control total.

---

## Arquitectura en una línea

```
Usuario → useMutation → [online] → Server  
                      → [offline] → mutation-queue (IDB) + pagos-cache (IDB)
OfflineIndicator → polling getPendingCount → al reconectar → processMutationQueue → Server → clearCache → invalidateQueries
queryFn → [online] → Server + cachea en IDB  
        → [offline] → IDB → si vacío → OfflineNoCacheError → OfflineRouteBlock
SW → [assets] cacheFirst | [/api/] networkFirst | [navigate] networkFirstWithOffline → offline.html
```

---

## Archivos a crear

```
public/
  sw.js              ← Service Worker (estrategias de cache)
  manifest.json      ← Web App Manifest (PWA installability)
  offline.html       ← Fallback HTML sin JS ni imports externos
  logo192.png        ← Ícono PWA
  logo512.png        ← Ícono PWA (maskable)

src/
  hooks/
    use-online-status.ts          ← useSyncExternalStore sobre window online/offline
  lib/
    offline/
      db.ts                       ← openDB, mutation-queue, {entidad}-cache
      sync.ts                     ← processMutationQueue con mutex isSyncing
      errors.ts                   ← OfflineNoCacheError + isOfflineNoCacheError
  components/
    offline-indicator.tsx         ← Barra bottom, polling adaptativo, auto-sync trigger
    pwa-register.tsx              ← Registro SW, banner "nueva versión disponible"
    offline-route-block.tsx       ← UI cuando offline sin cache (en errorComponent)
  routes/
    __root.tsx                    ← Montar <OfflineIndicator /> + <PWARegister /> + manifest link
  queries/
    {entidad}/
      {entidad}-query.ts          ← queryFn con try/catch → IDB fallback + networkMode:"always"
      use-create-{entidad}.ts     ← mutationFn con try/catch → addMutationToQueue + putInCache
      use-update-{entidad}.ts     ← ídem
      use-delete-{entidad}.ts     ← ídem → removePagoFromCache
```

---

## Código completo — cada archivo

### `public/sw.js`

```js
const CACHE_STATIC = "app-static-v1"
const CACHE_PAGES  = "app-pages-v1"
const CACHE_API    = "app-api-v1"

const PRECACHE_URLS = ["/", "/offline.html", "/manifest.json", "/logo192.png", "/logo512.png", "/favicon.ico"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_STATIC).then(c => c.addAll(PRECACHE_URLS)))
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_STATIC && k !== CACHE_PAGES && k !== CACHE_API)
            .map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== "GET") return
  if (!url.protocol.startsWith("http")) return

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, CACHE_API)); return
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOffline(request)); return
  }
  event.respondWith(cacheFirst(request, CACHE_STATIC))
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch { return new Response("", { status: 408 }) }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503, headers: { "Content-Type": "application/json" }
    })
  }
}

async function networkFirstWithOffline(request) {
  const cache = await caches.open(CACHE_PAGES)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
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
```

### `public/manifest.json`

```json
{
  "name": "Mi App",
  "short_name": "App",
  "description": "Descripción de la app",
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
    { "src": "/screenshot-wide.png",   "sizes": "1280x720", "type": "image/png", "form_factor": "wide"   }
  ]
}
```

### `src/hooks/use-online-status.ts`

```ts
import { useSyncExternalStore } from "react"

function subscribe(callback: () => void) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // getSnapshot — cliente
    () => true              // getServerSnapshot — SSR: asumir online
  )
}
```

### `src/lib/offline/errors.ts`

```ts
export class OfflineNoCacheError extends Error {
  constructor(message = "Sin conexión y sin datos guardados para esta página") {
    super(message)
    this.name = "OfflineNoCacheError"
  }
}

export function isOfflineNoCacheError(error: unknown): error is OfflineNoCacheError {
  return error instanceof OfflineNoCacheError
}
```

### `src/lib/offline/db.ts` (template — adaptar por entidad)

```ts
import { openDB, type IDBPDatabase } from "idb"
import type { EntityType } from "db/entity/schema"

const DB_NAME    = "myapp-offline"
const DB_VERSION = 1

export type MutationEntry = {
  id?:       number
  type:      "create" | "update" | "delete"
  payload:   any
  createdAt: number
}

interface MyAppDB {
  "mutation-queue": {
    key:     number
    value:   MutationEntry
    indexes: { "by-created": number }
  }
  "entity-cache": {
    key:     string        // id de la entidad
    value:   EntityType
    indexes: { "by-date": number }  // ajustar según el campo de fecha/periodo
  }
}

let dbInstance: IDBPDatabase<MyAppDB> | null = null

export async function openMyAppDB() {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<MyAppDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains("mutation-queue")) {
        const store = db.createObjectStore("mutation-queue", { keyPath: "id", autoIncrement: true })
        store.createIndex("by-created", "createdAt")
      }
      if (oldVersion < 1 && !db.objectStoreNames.contains("entity-cache")) {
        const store = db.createObjectStore("entity-cache", { keyPath: "id" })
        store.createIndex("by-date", "date")  // cambiar "date" por el campo real
      }
    }
  })
  return dbInstance
}

// --- Mutation queue ---
export async function addMutationToQueue(type: MutationEntry["type"], payload: any) {
  const db = await openMyAppDB()
  await db.add("mutation-queue", { type, payload, createdAt: Date.now() })
}
export async function getPendingCount()  { return (await openMyAppDB()).count("mutation-queue") }
export async function getMutationQueue() { return (await openMyAppDB()).getAll("mutation-queue") }
export async function removeMutationFromQueue(id: number) {
  await (await openMyAppDB()).delete("mutation-queue", id)
}
export async function clearMutationQueue() { await (await openMyAppDB()).clear("mutation-queue") }

// --- Entity cache ---
export async function putEntityInCache(entity: EntityType) {
  await (await openMyAppDB()).put("entity-cache", entity)
}
export async function removeEntityFromCache(id: string) {
  await (await openMyAppDB()).delete("entity-cache", id)
}
export async function getCachedEntityById(id: string) {
  return (await openMyAppDB()).get("entity-cache", id)
}
export async function getCachedEntitiesByRange(start: number, end: number) {
  return (await openMyAppDB()).getAllFromIndex(
    "entity-cache", "by-date", IDBKeyRange.bound(start, end, false, true)
  )
}
export async function saveEntitiesToCache(start: number, end: number, entities: EntityType[]) {
  const db = await openMyAppDB()
  const tx = db.transaction("entity-cache", "readwrite")
  await tx.store.delete(IDBKeyRange.bound(start, end, false, true))
  for (const e of entities) await tx.store.put(e)
  await tx.done
}
export async function clearEntityCache() { await (await openMyAppDB()).clear("entity-cache") }
```

### `src/lib/offline/sync.ts`

```ts
import { getMutationQueue, removeMutationFromQueue, getPendingCount, clearEntityCache } from "./db"
import { createEntityServer } from "server/entity/create-entity-server"
import { updateEntityServer } from "server/entity/update-entity-server"
import { deleteEntityServer } from "server/entity/delete-entity-server"

let isSyncing = false

async function processOneMutation(entry: { id?: number; type: "create"|"update"|"delete"; payload: any }) {
  switch (entry.type) {
    case "create": await createEntityServer({ data: entry.payload }); break
    case "update": await updateEntityServer({ data: entry.payload }); break
    case "delete": await deleteEntityServer({ data: { id: entry.payload.id } }); break
  }
}

/**
 * Procesa la cola FIFO. Tolerante a fallos individuales (un item fallido
 * no bloquea los siguientes). Devuelve true si la cola quedó vacía.
 */
export async function processMutationQueue(): Promise<boolean> {
  if (isSyncing) return false
  const count = await getPendingCount()
  if (count === 0) return false

  isSyncing = true
  try {
    const queue = await getMutationQueue()
    for (const entry of queue) {
      try {
        await processOneMutation(entry)
        if (entry.id != null) await removeMutationFromQueue(entry.id)
      } catch { /* item fallido: queda en cola, continuar */ }
    }
  } finally {
    isSyncing = false
  }

  const remaining = await getPendingCount()
  // Limpiar cache de lectura: la próxima lectura online traerá IDs definitivos del server
  if (remaining === 0) await clearEntityCache()
  return remaining === 0
}
```

### `src/components/offline-indicator.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { getPendingCount } from "@/lib/offline/db"
import { processMutationQueue } from "@/lib/offline/sync"
import { Wifi, WifiOff } from "lucide-react"

const PENDING_COUNT_KEY = ["offline", "pending-count"] as const

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const queryClient = useQueryClient()
  const [syncing, setSyncing] = useState(false)
  const [shouldPoll, setShouldPoll] = useState(false)

  // Polling adaptativo: activo solo cuando offline o hay pendientes
  const { data: pending = 0 } = useQuery({
    queryKey: PENDING_COUNT_KEY,
    queryFn: () => getPendingCount(),
    enabled: typeof window !== "undefined" && shouldPoll,
    refetchInterval: shouldPoll ? 5000 : false,
    staleTime: 1000,
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    setShouldPoll(!isOnline || pending > 0)
  }, [isOnline, pending])

  // Auto-sync al reconectarse (único dueño del trigger)
  useEffect(() => {
    if (!isOnline || pending === 0 || syncing) return
    let cancelled = false
    setSyncing(true)
    processMutationQueue()
      .catch(() => {})
      .finally(() => {
        if (cancelled) return
        setSyncing(false)
        queryClient.invalidateQueries({ queryKey: PENDING_COUNT_KEY })
        queryClient.invalidateQueries({ queryKey: ["entities"] }) // ajustar queryKey raíz
      })
    return () => { cancelled = true }
  }, [isOnline, pending, syncing, queryClient])

  if (pending === 0 && isOnline) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 text-sm flex items-center justify-center gap-2">
      {isOnline ? (
        <>
          <Wifi size={14} />
          <span>
            {syncing
              ? `Sincronizando ${pending} cambio${pending !== 1 ? "s" : ""}...`
              : `${pending} cambio${pending !== 1 ? "s" : ""} pendiente${pending !== 1 ? "s" : ""}`}
          </span>
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span>
            Sin conexión{pending > 0 ? ` — ${pending} cambio${pending !== 1 ? "s" : ""} pendiente${pending !== 1 ? "s" : ""}` : ""}
          </span>
        </>
      )}
    </div>
  )
}
```

### `src/components/pwa-register.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"

export function PWARegister() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)

  useEffect(() => {
    if (import.meta.env.DEV || !("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller)
            setNeedRefresh(true)
        })
      })
    })

    navigator.serviceWorker.ready.then(() => {
      setOfflineReady(true)
      setTimeout(() => setOfflineReady(false), 5000)
    })
  }, [])

  const updateSW = () => {
    navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" })
    setNeedRefresh(false)
    window.location.reload()
  }

  if (import.meta.env.DEV) return null

  return (
    <>
      {offlineReady && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
          App lista para uso offline
        </div>
      )}
      {needRefresh && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-zinc-800 px-4 py-3 text-sm text-white shadow-lg">
          <span>Nueva versión disponible</span>
          <button onClick={updateSW} className="rounded bg-blue-600 px-3 py-1 text-xs font-medium hover:bg-blue-500">
            Actualizar
          </button>
          <button onClick={() => setNeedRefresh(false)} className="text-xs text-zinc-400 hover:text-white">
            Cerrar
          </button>
        </div>
      )}
    </>
  )
}
```

### `src/components/offline-route-block.tsx`

```tsx
import { WifiOff } from "lucide-react"

export function OfflineRouteBlock() {
  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6 text-center">
      <WifiOff size={48} className="text-amber-500" />
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Sin conexión</h2>
        <p className="text-muted-foreground max-w-sm">
          No tenés datos guardados de esta página para ver offline.
          Volvé a una página que ya tengas cargada o reconectate para verla.
        </p>
      </div>
      <div className="flex gap-2 items-center flex-wrap justify-center">
        <button type="button" onClick={() => window.history.back()}
          className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold">
          Volver
        </button>
        <button type="button" onClick={() => window.location.reload()}
          className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold">
          Reintentar
        </button>
      </div>
    </div>
  )
}
```

### Patrón en `queryOptions` (networkMode obligatorio)

```ts
import { queryOptions } from "@tanstack/react-query"
import { OfflineNoCacheError } from "@/lib/offline/errors"
import { getCachedEntityById, putEntityInCache, saveEntitiesToCache, getCachedEntitiesByRange } from "@/lib/offline/db"

const isClient = typeof window !== "undefined"

// Por ID
export const entityQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["entities", "byId", id],
    queryFn: async () => {
      try {
        const data = await getEntityByIdServer({ data: { id } })
        if (isClient && data) await putEntityInCache(data)
        return data
      } catch {
        if (!isClient) throw new OfflineNoCacheError()
        const cached = await getCachedEntityById(id)
        if (!cached) throw new OfflineNoCacheError()
        return cached
      }
    },
    networkMode: "always", // ⚠️ OBLIGATORIO para que queryFn ejecute offline
  })

// Por rango de fechas
export const entitiesByRangeQueryOptions = (start: number, end: number) =>
  queryOptions({
    queryKey: ["entities", "byRange", start, end],
    queryFn: async () => {
      try {
        const data = await getEntitiesByRangeServer({ data: { start, end } })
        if (isClient) await saveEntitiesToCache(start, end, data)
        return data
      } catch {
        if (!isClient) throw new OfflineNoCacheError()
        const cached = await getCachedEntitiesByRange(start, end)
        if (cached.length === 0) throw new OfflineNoCacheError()
        return cached
      }
    },
    networkMode: "always",
  })
```

### Patrón en `useMutation` (fallback offline)

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addMutationToQueue, putEntityInCache, removeEntityFromCache } from "@/lib/offline/db"

// CREATE
export function useCreateEntity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ data }: { data: EntityFormType }) => {
      try {
        return await createEntityServer({ data })
      } catch {
        const newEntity: EntityType = { ...data, id: crypto.randomUUID() } // ID temporal
        await addMutationToQueue("create", newEntity)
        await putEntityInCache(newEntity)
        return newEntity
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<EntityType[]>(["entities"], old => old ? [data, ...old] : [data])
      queryClient.invalidateQueries({ queryKey: ["entities"], refetchType: "active" })
    }
  })
}

// UPDATE
export function useUpdateEntity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ data }: { data: EntityType }) => {
      try {
        return await updateEntityServer({ data })
      } catch {
        await addMutationToQueue("update", data)
        await putEntityInCache(data)
        return data
      }
    },
    onSuccess: (data) => {
      if (!data) return
      queryClient.setQueryData<EntityType>(["entities", "byId", data.id], data)
      queryClient.setQueryData<EntityType[]>(["entities"], old =>
        old ? old.map(e => e.id === data.id ? data : e) : old
      )
    }
  })
}

// DELETE
export function useDeleteEntity(entityId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ data }: { data: { id: string } }) => {
      try {
        await deleteEntityServer({ data })
      } catch {
        await addMutationToQueue("delete", data)
        await removeEntityFromCache(data.id)
      }
      return data
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["entities", "byId", entityId] })
      queryClient.setQueryData<EntityType[]>(["entities"], old =>
        old ? old.filter(e => e.id !== entityId) : old
      )
    }
  })
}
```

### Root layout — montar los componentes

```tsx
// src/routes/__root.tsx (o equivalent en tu framework)
import { PWARegister } from "@/components/pwa-register"
import { OfflineIndicator } from "@/components/offline-indicator"

// En head:
links: [
  { rel: "manifest", href: "/manifest.json" },
  { rel: "stylesheet", href: appCss }
],
meta: [{ name: "theme-color", content: "#09090b" }]

// En body:
<body>
  <OfflineIndicator />
  {children}
  <PWARegister />
</body>
```

---

## Gotchas críticos

| # | Problema | Solución |
|---|---------|---------|
| 1 | React Query pausa la queryFn cuando detecta offline | `networkMode: "always"` en todos los queryOptions con fallback |
| 2 | IndexedDB no existe en SSR | `const isClient = typeof window !== "undefined"` antes de toda llamada a IDB |
| 3 | SSR rompe hidratación con `navigator.onLine` | `getServerSnapshot` en `useSyncExternalStore` devuelve `true` |
| 4 | SW en DEV rompe hot reload | `if (import.meta.env.DEV) return null` en `PWARegister` |
| 5 | IDs temporales en creates offline | Al sync exitoso: `clearEntityCache()` + `invalidateQueries` para traer IDs del server |
| 6 | Polling innecesario cuando todo está OK | `shouldPoll` activar solo si `!isOnline || pending > 0` |
| 7 | Migraciones de IDB fallan si el store existe | Siempre verificar `db.objectStoreNames.contains()` en `upgrade()` |
| 8 | SW no se actualiza automáticamente | `SKIP_WAITING` via `postMessage` + banner en `PWARegister` |

---

## Checklist de implementación

### Setup
- [ ] `pnpm add idb`
- [ ] `public/sw.js` con 3 estrategias de cache
- [ ] `public/offline.html` (HTML puro, sin JS ni imports externos)
- [ ] `public/manifest.json` con campos obligatorios
- [ ] Iconos 192×192 y 512×512 (512 = maskable)

### Archivos
- [ ] `src/hooks/use-online-status.ts`
- [ ] `src/lib/offline/errors.ts`
- [ ] `src/lib/offline/db.ts` (adaptar por entidad del dominio)
- [ ] `src/lib/offline/sync.ts` (mapear mutations a server fns)
- [ ] `src/components/offline-indicator.tsx`
- [ ] `src/components/pwa-register.tsx`
- [ ] `src/components/offline-route-block.tsx`

### Integración
- [ ] `networkMode: "always"` en todos los queryOptions con fallback offline
- [ ] try/catch en todos los mutationFn → cola + cache de lectura
- [ ] `<OfflineIndicator />` y `<PWARegister />` en root layout
- [ ] `manifest.json` linkeado en `<head>`
- [ ] `errorComponent` de rutas críticas usa `OfflineRouteBlock` cuando `isOfflineNoCacheError`
