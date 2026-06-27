# Plan: PWA + Offline CRUD de Pagos con IndexedDB

## Resumen

**PWA (Progressive Web App):**
- Service Worker manual (sin `vite-plugin-pwa` — incompatible con TanStack Start + Nitro)
- Manifest.json en `public/`
- Offline fallback a `public/offline.html`
- Update prompt para nueva versión
- Banner offline con `OfflineIndicator`

**Offline CRUD:**
- Lectura offline (cache de datos leidos)
- CRUD offline solo para pagos (create, update, delete)
- Sin resolucion de conflictos (ultima escritura gana)

---

## PWA: Configuración

### Por qué NO se usa `vite-plugin-pwa`

`vite-plugin-pwa` genera el SW en `dist/` durante el build del client, pero TanStack Start + Nitro copia los assets a `.output/public/`. Son dos builds separados, lo que genera:
- SW con contenido roto (SyntaxError en el browser)
- Conflictos entre `dist/sw.js` y `.output/public/sw.js`
- Manifest no se sirve correctamente

**Solución:** SW manual en `public/sw.js` + `public/manifest.json`. Nitro copia todo `public/` a `.output/public/` automáticamente.

### Archivos de PWA

| Archivo | Descripción |
|---------|-------------|
| `public/sw.js` | Service Worker manual con cache strategies |
| `public/manifest.json` | Web App Manifest |
| `public/offline.html` | Página de fallback cuando offline |
| `src/components/pwa-register.tsx` | Registro del SW + update prompt |
| `src/components/offline-indicator.tsx` | Banner "Sin conexión" en top bar |
| `src/routes/__root.tsx` | Link al manifest + theme-color |

### `public/sw.js` — Estrategias de Cache

```
Cache STATIC  → assets estáticos (logos, CSS, JS bundles)
Cache PAGES   → rutas visitadas (navigate requests)
Cache API     → responses de /api/*
```

| Tipo de request | Estrategia | Descripción |
|-----------------|------------|-------------|
| `GET` no-navigate | Cache First | Busca en cache, si no existe fetch + cache |
| `/api/*` | Network First | Intenta red, si falla usa cache |
| Navigate (rutas) | Network First + offline fallback | Intenta red, si falla busca cache, si no tiene muestra `offline.html` |
| Non-GET | Skip | No intercepta POST, PUT, DELETE |

### `public/sw.js` — Precache

El SW precachea estáticamente al instalarse:
```js
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico",
]
```

### `src/components/pwa-register.tsx`

- Solo registra el SW en producción (`import.meta.env.PROD`)
- Detecta cuando hay un nuevo SW instalado → muestra toast "Nueva versión disponible"
- Al clickear "Actualizar" → envía `SKIP_WAITING` al SW y recarga la página
- Muestra "App lista para uso offline" al activarse

### `src/components/offline-indicator.tsx`

- Banner fijo arriba de todo (`fixed top-0 z-50`)
- Se muestra cuando:
  - El usuario está **offline** (siempre)
  - El usuario está **online** pero hay cambios pendientes en la cola de mutaciones
- Muestra `WifiOff` icon + "Sin conexión" cuando offline
- Muestra `Wifi` icon + count de pendientes cuando online pero con cola
- Auto-sync: al volver online, procesa la cola de mutaciones pendientes

### `src/routes/__root.tsx`

```tsx
head: () => ({
  meta: [
    { name: "theme-color", content: "#09090b" },
    // ... viewport, charset, etc.
  ],
  links: [
    { rel: "manifest", href: "/manifest.json" },
    // ... stylesheet
  ],
})
```

### `package.json`

```json
{
  "scripts": {
    "preview": "node .output/server/index.mjs"
  }
}
```

**Por qué no `vite preview`:** `vite preview` sirve desde `dist/` como SPA estática. TanStack Start genera un server SSR en `.output/server/` que maneja server functions, API routes y SSR. Se necesita `node .output/server/index.mjs`.

### Testing PWA

1. **Build:** `pnpm build`
2. **Preview:** `node .output/server/index.mjs`
3. **Chrome DevTools → Application:**
   - Service Workers: "Activated and is running"
   - Manifest: nombre, iconos, display standalone
   - Cache Storage: caches STATIC, PAGES, API
4. **Test offline:** Network → Offline → recargar → debería mostrar offline.html en rutas no cacheadas
5. **Test update:** hacer cambio → rebuild → preview → debería aparecer toast de actualización

---

## Offline CRUD: Plan Original

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│                    UI (React)                    │
│  useCreatePago / useUpdatePago / useDeletePago   │
└─────────────┬───────────────────┬───────────────┘
              │ online            │ offline
              ▼                   ▼
┌──────────────────┐  ┌──────────────────────────┐
│  Server Functions │  │   IndexedDB (client)     │
│  (Better Auth)    │  │  ┌────────────────────┐  │
│  createPagoServer │  │  │ pagos-cache        │  │
│  updatePagoServer │  │  │ (copia local de    │  │
│  deletePagoServer │  │  │  los pagos)        │  │
└──────────────────┘  │  ├────────────────────┤  │
                      │  │ mutation-queue      │  │
                      │  │ (operaciones pendientes)│
                      │  │ create / update / delete │
                      │  └────────────────────┘  │
                      └──────────────────────────┘
                               │
                      ┌────────▼────────┐
                      │  Sync Manager    │
                      │  (al volver      │
                      │   online, replay)│
                      └─────────────────┘
```

---

## Capa IndexedDB

### Archivo: `src/lib/offline/db.ts`

Libreria base que expone la conexion a IndexedDB.

```ts
import { openDB, type IDBPDatabase } from "idb"

const DB_NAME = "ragazzi-offline"
const DB_VERSION = 1

interface RagazziDB {
  "pagos-cache": {
    key: string
    value: PagoType & { _cachedAt: number }
    indexes: { "by-periodo": number }
  }
  "mutation-queue": {
    key: number
    value: MutationEntry
    indexes: { "by-created": number }
  }
}

export type MutationEntry = {
  id?: number  // auto-increment
  type: "create" | "update" | "delete"
  payload: any  // PagoType para create/update, { id: string } para delete
  createdAt: number
}

let dbInstance: IDBPDatabase<RagazziDB> | null = null

export async function openRagazziDB(): Promise<IDBPDatabase<RagazziDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<RagazziDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store de cache de pagos
      const pagosStore = db.createObjectStore("pagos-cache", { keyPath: "id" })
      pagosStore.createIndex("by-periodo", "periodo")

      // Store de cola de mutaciones pendientes
      const queueStore = db.createObjectStore("mutation-queue", {
        keyPath: "id",
        autoIncrement: true,
      })
      queueStore.createIndex("by-created", "createdAt")
    },
  })

  return dbInstance
}
```

### Operaciones de Cache

```ts
// Guardar pagos en cache (reemplaza todo)
export async function savePagosToCache(pagos: PagoType[]): Promise<void> {
  const db = await openRagazziDB()
  const tx = db.transaction("pagos-cache", "readwrite")
  await tx.store.clear()
  for (const pago of pagos) {
    await tx.store.put({ ...pago, _cachedAt: Date.now() })
  }
  await tx.done
}

// Agregar un pago al cache (para create offline)
export async function addPagoToCache(pago: PagoType): Promise<void> {
  const db = await openRagazziDB()
  await db.put("pagos-cache", { ...pago, _cachedAt: Date.now() })
}

// Actualizar un pago en cache (para update offline)
export async function updatePagoInCache(pago: PagoType): Promise<void> {
  const db = await openRagazziDB()
  await db.put("pagos-cache", { ...pago, _cachedAt: Date.now() })
}

// Eliminar un pago del cache (para delete offline)
export async function removePagoFromCache(id: string): Promise<void> {
  const db = await openRagazziDB()
  await db.delete("pagos-cache", id)
}

// Leer todos los pagos del cache
export async function getCachedPagos(): Promise<PagoType[]> {
  const db = await openRagazziDB()
  return db.getAll("pagos-cache")
}

// Leer pagos por periodo del cache
export async function getCachedPagosByPeriodo(
  start: number,
  end: number
): Promise<PagoType[]> {
  const db = await openRagazziDB()
  const all = await db.getAllFromIndex("pagos-cache", "by-periodo")
  return all.filter((p) => p.periodo >= start && p.periodo < end)
}

// Limpiar todo el cache
export async function clearPagosCache(): Promise<void> {
  const db = await openRagazziDB()
  await db.clear("pagos-cache")
}
```

### Operaciones de Cola de Mutaciones

```ts
// Encolar una mutacion
export async function addMutationToQueue(
  type: MutationEntry["type"],
  payload: MutationEntry["payload"]
): Promise<void> {
  const db = await openRagazziDB()
  await db.add("mutation-queue", {
    type,
    payload,
    createdAt: Date.now(),
  })
}

// Obtener todas las mutaciones pendientes
export async function getMutationQueue(): Promise<MutationEntry[]> {
  const db = await openRagazziDB()
  return db.getAll("mutation-queue")
}

// Obtener cantidad de pendientes
export async function getPendingCount(): Promise<number> {
  const db = await openRagazziDB()
  return db.count("mutation-queue")
}

// Eliminar una mutacion de la cola
export async function removeMutationFromQueue(id: number): Promise<void> {
  const db = await openRagazziDB()
  await db.delete("mutation-queue", id)
}

// Limpiar toda la cola
export async function clearMutationQueue(): Promise<void> {
  const db = await openRagazziDB()
  await db.clear("mutation-queue")
}
```

---

## Capa Sync

### Archivo: `src/lib/offline/sync.ts`

Maneja la sincronizacion cuando vuelve la conexion.

```ts
import { getMutationQueue, removeMutationFromQueue, clearPagosCache } from "./db"
import { createPagoServer } from "server/pagos/create-pago-server"
import { updatePagoServer } from "server/pagos/update-pago-server"
import { deletePagoServer } from "server/pagos/delete-pago-server"

export type SyncResult = {
  synced: number
  failed: number
  errors: string[]
}

// Procesar todas las mutaciones pendientes
export async function processMutationQueue(): Promise<SyncResult> {
  const queue = await getMutationQueue()
  const result: SyncResult = { synced: 0, failed: 0, errors: [] }

  // Procesar en orden: creates, updates, deletes
  const sorted = [...queue].sort((a, b) => {
    const order = { create: 0, update: 1, delete: 2 }
    return order[a.type] - order[b.type]
  })

  for (const mutation of sorted) {
    try {
      switch (mutation.type) {
        case "create":
          await createPagoServer({ data: mutation.payload })
          break
        case "update":
          await updatePagoServer({ data: mutation.payload })
          break
        case "delete":
          await deletePagoServer({ data: mutation.payload })
          break
      }
      if (mutation.id) {
        await removeMutationFromQueue(mutation.id)
      }
      result.synced++
    } catch (error) {
      result.failed++
      result.errors.push(
        `Failed to ${mutation.type}: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      // No eliminamos de la cola — se reintentara en el proximo sync
    }
  }

  // Si todo sincronizo, limpiar cache local para forzar refresh desde server
  if (result.failed === 0) {
    await clearPagosCache()
  }

  return result
}

// Wrapper para ejecutar sync y invalidar queries de TanStack
export async function syncAndRefresh(
  queryClient: QueryClient
): Promise<SyncResult> {
  const result = await processMutationQueue()

  if (result.synced > 0) {
    // Refrescar datos desde el server
    await queryClient.invalidateQueries({
      queryKey: ["pagos"],
      refetchType: "all",
    })
  }

  return result
}

// Chequear si esta online
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine
}

// Registrar listener para auto-sync al volver online
export function onOnline(callback: () => void): () => void {
  const handler = () => callback()
  window.addEventListener("online", handler)
  return () => window.removeEventListener("online", handler)
}
```

---

## Hook de Estado Online

### Archivo: `src/hooks/use-online-status.ts`

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

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true // asumir online en SSR
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

---

## Mutation Hooks Modificados

### `queries/pagos/use-create-pago.ts`

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPagoServer } from "server/pagos/create-pago-server"
import { queryKeys } from "queries/query-keys"
import { getPeriodo } from "@/lib/utils"
import { isOnline } from "@/lib/offline/sync"
import { addPagoToCache, addMutationToQueue } from "@/lib/offline/db"
import type { PagoFormType } from "db/pagos/pago-validator"

export function useCreatePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PagoFormType) => {
      if (isOnline()) {
        // Online: server function normal
        return createPagoServer({ data })
      }

      // Offline: guardar localmente
      const newPago = {
        ...data,
        id: crypto.randomUUID(),
      }
      await addPagoToCache(newPago)
      await addMutationToQueue("create", newPago)

      return newPago
    },
    onSuccess: async (data) => {
      if (!data) return
      const [start, end] = getPeriodo(undefined, undefined)

      // Optimistic update en query cache
      queryClient.setQueryData(
        queryKeys.pagos.byPeriodo(start, end),
        (old: any[]) => {
          if (!old) return [data]
          return [data, ...old]
        }
      )

      // Si estaba online, invalidar para refrescar desde server
      if (isOnline()) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pagos.all,
          refetchType: "active",
        })
      }
    },
  })
}
```

### `queries/pagos/use-update-pago.ts`

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePagoServer } from "server/pagos/update-pago-server"
import { queryKeys } from "queries/query-keys"
import { getPeriodo } from "@/lib/utils"
import { isOnline } from "@/lib/offline/sync"
import { updatePagoInCache, addMutationToQueue } from "@/lib/offline/db"
import type { PagoType } from "db/pagos/schema"

export function useUpdatePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data }: { data: PagoType }) => {
      if (isOnline()) {
        return updatePagoServer({ data })
      }

      // Offline: actualizar localmente
      await updatePagoInCache(data)
      await addMutationToQueue("update", data)

      return data
    },
    onSuccess: (data) => {
      if (!data) return
      const [start, end] = getPeriodo(undefined, undefined)

      // Optimistic update
      queryClient.setQueryData(queryKeys.pagos.byId(data.id), data)
      queryClient.setQueryData(
        queryKeys.pagos.byPeriodo(start, end),
        (old: PagoType[]) => {
          if (!old) return old
          return old.map((p) => (p.id === data.id ? data : p))
        }
      )

      if (isOnline()) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pagos.all,
          refetchType: "active",
        })
      }
    },
  })
}
```

### `queries/pagos/use-delete-pago.ts`

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deletePagoServer } from "server/pagos/delete-pago-server"
import { queryKeys } from "queries/query-keys"
import { getPeriodo } from "@/lib/utils"
import { isOnline } from "@/lib/offline/sync"
import { removePagoFromCache, addMutationToQueue } from "@/lib/offline/db"

export function useDeletePago(pagoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data }: { data: { id: string } }) => {
      if (isOnline()) {
        return deletePagoServer({ data })
      }

      // Offline: eliminar localmente
      await removePagoFromCache(data.id)
      await addMutationToQueue("delete", { id: data.id })

      return { id: data.id }
    },
    onSuccess: () => {
      const [start, end] = getPeriodo(undefined, undefined)

      queryClient.removeQueries({ queryKey: queryKeys.pagos.byId(pagoId) })
      queryClient.setQueryData(
        queryKeys.pagos.byPeriodo(start, end),
        (old: any[]) => {
          if (!old) return old
          return old.filter((item) => item.id !== pagoId)
        }
      )

      if (isOnline()) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pagos.all,
          refetchType: "active",
        })
      }
    },
  })
}
```

---

## Cache de Queries (Lectura Offline)

### Modificar `queries/pagos/pagos-query.ts`

Para que las queries lean de IndexedDB cuando offline:

```ts
import { queryOptions } from "@tanstack/react-query"
import { getPagosServer } from "server/pagos/get-pagos-server"
import { getPagosByPeriodoServer } from "server/pagos/get-pagos-by-periodo-server"
import { getPagosBySectorServer } from "server/pagos/get-pagos-by-sector-server"
import { getPagoByIdServer } from "server/pagos/get-pago-by-id-server"
import { queryKeys } from "queries/query-keys"
import { isOnline } from "@/lib/offline/sync"
import { getCachedPagos, getCachedPagosByPeriodo } from "@/lib/offline/db"

export const pagosQueryOptions = queryOptions({
  queryKey: queryKeys.pagos.all,
  queryFn: async () => {
    if (isOnline()) {
      const data = await getPagosServer()
      // Guardar en cache para uso offline
      const { savePagosToCache } = await import("@/lib/offline/db")
      await savePagosToCache(data)
      return data
    }
    // Offline: leer del cache
    return getCachedPagos()
  },
  staleTime: 60 * 1000,
  refetchInterval: 60 * 1000,
  // Permitir queries incluso offline
  networkMode: "always",
})

export const pagosByPeriodoQueryOptions = (start: number, end: number) =>
  queryOptions({
    queryKey: queryKeys.pagos.byPeriodo(start, end),
    queryFn: async () => {
      if (isOnline()) {
        return getPagosByPeriodoServer({ data: { start, end } })
      }
      return getCachedPagosByPeriodo(start, end)
    },
    networkMode: "always",
  })

// ... igual para las demas queries
```

---

## UI Components

### Indicador Offline (`src/components/offline-indicator.tsx`)

```tsx
"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { getPendingCount } from "@/lib/offline/db"
import { syncAndRefresh } from "@/lib/offline/sync"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const queryClient = useQueryClient()
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)

  // Actualizar count de pendientes
  useEffect(() => {
    getPendingCount().then(setPendingCount)
    const interval = setInterval(() => {
      getPendingCount().then(setPendingCount)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-sync al volver online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync()
    }
  }, [isOnline])

  const handleSync = async () => {
    setSyncing(true)
    const result = await syncAndRefresh(queryClient)
    setSyncing(false)
    await getPendingCount().then(setPendingCount)

    if (result.synced > 0) {
      // showToast(`${result.synced} operaciones sincronizadas`)
    }
    if (result.failed > 0) {
      // showToast(`${result.failed} operaciones fallaron`, "error")
    }
  }

  if (isOnline && pendingCount === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-sm flex items-center justify-center gap-2">
          <WifiOff size={14} />
          Sin conexion — Los cambios se guardan localmente
          {pendingCount > 0 && (
            <span className="bg-amber-800 px-2 py-0.5 rounded-full text-xs">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
      {isOnline && pendingCount > 0 && (
        <div className="bg-blue-600 text-white px-4 py-2 text-sm flex items-center justify-center gap-2">
          <Wifi size={14} />
          Sincronizando cambios...
          <button
            onClick={handleSync}
            disabled={syncing}
            className="underline text-xs"
          >
            {syncing ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              "Reintentar"
            )}
          </button>
        </div>
      )}
    </div>
  )
}
```

### Integrar en Root (`src/routes/__root.tsx`)

```tsx
import { OfflineIndicator } from "@/components/offline-indicator"

// En RootDocument:
<body>
  <OfflineIndicator />
  {children}
  {/* ... */}
</body>
```

---

## Dependencias

```bash
pnpm add idb
```

`idb` es un wrapper liviano (~1.2kB) de IndexedDB con soporte TypeScript y promises.

---

## Archivos a Crear/Modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `src/lib/offline/db.ts` | **CREAR** | Capa IndexedDB: schema, cache, cola de mutaciones |
| `src/lib/offline/sync.ts` | **CREAR** | Logica de sync: procesar cola, isOnline, onOnline |
| `src/hooks/use-online-status.ts` | **CREAR** | Hook React para estado online/offline |
| `src/components/offline-indicator.tsx` | **CREAR** | UI: barra de estado offline + sync |
| `queries/pagos/use-create-pago.ts` | **MODIFICAR** | Agregar branch offline |
| `queries/pagos/use-update-pago.ts` | **MODIFICAR** | Agregar branch offline |
| `queries/pagos/use-delete-pago.ts` | **MODIFICAR** | Agregar branch offline |
| `queries/pagos/pagos-query.ts` | **MODIFICAR** | Agregar fallback a cache + `networkMode: "always"` |
| `src/routes/__root.tsx` | **MODIFICAR** | Agregar `<OfflineIndicator />` |

---

## Flujo: Crear Pago Offline

```
1. Usuario llena form y presiona Guardar
2. useCreatePago detecta navigator.onLine === false
3. Genera UUID con crypto.randomUUID()
4. Guarda pago en IndexedDB "pagos-cache"
5. Encola { type: "create", payload: pagoCompleto } en "mutation-queue"
6. Actualiza optimistamente query cache de TanStack Query (byPeriodo)
7. Muestra toast: "Pago guardado offline"
```

## Flujo: Sync Automatico

```
1. Listener window "online" detecta reconexion
2. processMutationQueue() se ejecuta
3. Por cada mutation en la cola:
   - Llama server function (create/update/delete)
   - Si OK: elimina de la cola
   - Si falla: deja en cola
4. Despues de procesar todo:
   - Refresca cache de TanStack Query desde server
   - Limpia IndexedDB cache
5. Muestra toast: "X operaciones sincronizadas"
```

---

## Orden de Implementacion

1. `src/lib/offline/db.ts` — IndexedDB schema y operaciones
2. `src/hooks/use-online-status.ts` — hook basico
3. `queries/pagos/use-create-pago.ts` — agregar offline branch
4. `queries/pagos/use-update-pago.ts` — agregar offline branch
5. `queries/pagos/use-delete-pago.ts` — agregar offline branch
6. `queries/pagos/pagos-query.ts` — fallback a cache
7. `src/lib/offline/sync.ts` — procesamiento de cola
8. `src/components/offline-indicator.tsx` — UI
9. `src/routes/__root.tsx` — integrar todo

---

## Limitaciones

- **Sin resolucion de conflictos** — si el usuario modifica algo online mientras hay cola pendiente, la ultima escritura gana
- **Sin sync en tiempo real** — solo sync al volver online
- **Lectura offline solo del cache** — si el cache esta vacio (primera vez offline), no hay datos
- **UUID local** — `crypto.randomUUID()` genera IDs v4, collisions con server son extremadamente improbables
- **Cache de solo pagos** — rubros, links y otros datos no se cachean para offline
