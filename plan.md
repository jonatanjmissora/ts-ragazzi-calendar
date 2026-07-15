# Plan Offline + PWA — ts-ragazzi-calendar (Dashboard `/`)

> Referencia: [`offline-pwa`](.opencode/skills/offline-pwa/SKILL.md) — patrón genérico con código completo y gotchas.
>
> Offline solo aplica al dashboard `/` (pagos pendientes por periodo + CRUD).
> El área `/admin` (rubros, links, pagos admin) y el histograma no tienen implementación offline.

---

## ✅ Completado

### Setup
- [x] `public/sw.js` con 4 estrategias (network-only server functions, network-first API, network-first navigation con fallback offline.html, network-first assets) + `SKIP_WAITING`
- [x] `public/manifest.webmanifest` — `display: standalone`, icons 192×192 y 512×512, screenshots
- [x] `public/offline.html` (HTML puro offline)
- [x] Iconos /logo192.png, /logo512.png, /favicon.ico
- [x] `src/lib/offline/db.ts` — IndexedDB v3 con 2 stores: `mutation-queue` (escritura offline) y `pagos-cache` (lectura offline, index by-periodo)
- [x] `src/lib/offline/errors.ts` — `OfflineNoCacheError` + type guard
- [x] `src/lib/offline/sync.ts` — `processMutationQueue(queryClient?)`: procesa cola pagos (create/update/delete), mutex isSyncing, fallo individual no bloquea, al vaciarse actualiza cache React Query sin refetch
- [x] `src/hooks/use-online-status.ts` — hook `useOnlineStatus()` via `useSyncExternalStore`
- [x] `src/components/pwa-register.tsx` — registro manual SW + detecta nueva versión + toast "App lista para uso offline" + banner "Nueva versión disponible"
- [x] `src/components/offline-route-block.tsx` — bloque offline con botones Volver/Reintentar
- [x] `src/components/offline-indicator.tsx` — polling 3s con HEAD real a `/manifest.webmanifest`, muestra pendientes + detalle (rubro/sector), auto-sync al detectar online
- [x] `<PWARegister />` + `<OfflineIndicator />` montados en `__root.tsx`
- [x] `<link rel="manifest">` + `<meta name="theme-color">` en `__root.tsx`

### Lectura offline — pagos por periodo (dashboard)
- [x] `pagosByPeriodoQueryOptions(start, end)` con `networkMode: "always"`
- [x] **Server-first**: si `navigator.onLine`, fetch al server directo, write-through a IDB. Sin cache intermedio, sin bg sync — sin parpadeo
- [x] **Cache-fallback offline**: si `!navigator.onLine`, salta el server, lee `getCachedPagosByPeriodo` directo. Rápido, sin timeout de red
- [x] Si no hay cache para ese periodo y offline → `OfflineNoCacheError` → `OfflineRouteBlock` con botón Volver
- [x] `savePagosByPeriodoToCache` usa index `by-periodo` con `cursor.delete()`, NO `store.delete(range)` — UUIDs no matchean rangos numéricos
- [x] `refetchOnMount: "always"`, `refetchOnFocus: false`, `refetchOnReconnect: false` — solo refetch en montaje post-SSR
- [x] `sortPagos()` helper: `periodo DESC, rubro ASC, sector ASC` — mismo orden en cache y server
- [x] DB query `getPagosByPeriodoDB` con secondary sort: `asc(pagos.rubro), asc(pagos.sector)`
- [x] `pagoQueryOptions(itemId)` con mismo patrón server-first/cache-fallback + write-through a IDB

### Lectura offline — rubros (dashboard edit-pago)
- [x] `rubros-cache` store en IndexedDB v4
- [x] `rubrosQueryOptions` con `networkMode: "always"`, write-through a IDB en éxito, fallback a `getCachedRubros`, lanza `OfflineNoCacheError` si vacío
- [x] Sin `staleTime`/`refetchInterval` — usuario único, datos solo mutan por él
- [x] `saveRubrosToCache` / `getCachedRubros` en `db.ts`

### Mutaciones offline — CRUD pagos (dashboard)
- [x] `create-pago.tsx` (dashboard) — inline try/catch → `addMutationToQueue("create", ...)` + `putPagoInCache`
- [x] `check-pago-form.tsx` — inline try/catch → `addMutationToQueue("update", ...)` + `putPagoInCache` (se agregó put faltante)
- [x] `pagos-delete.tsx` — inline try/catch → `addMutationToQueue("delete", ...)` + `removePagoFromCache`
- [x] `sync.ts: processMutationQueue` — procesa cola pagos (create/update/delete), mutex isSyncing, fallo individual no bloquea, al vaciarse actualiza cache React Query con `setQueryData` (sin refetch)
- [x] **Lección**: formularios inline con try/catch propio deben llamar `putEntityInCache` en el catch — si no, el pago offline solo vive en React Query y se pierde al refrescar

### Theme (offline-compatible)
- [x] Theme switch con cookie-based persistence via server functions
- [x] `ScriptOnce` para FOUC prevention
- [x] `suppressHydrationWarning` en `<html>`
- [x] `useState("auto")` + `useEffect` post-hydration sync

---

## ✅ Verificación

- [x] Offline → dashboard muestra pagos cacheados del periodo
- [x] Offline → periodo no visitado → muestra "Sin conexion" con botón Volver
- [x] Offline → crear/editar/eliminar pago → barra muestra pendientes
- [x] Offline → delete → refresh ruta → datos persisten (delete desde IDB)
- [x] Offline → create → refresh ruta → pago offline persiste (putPagoInCache)
- [x] Online → F5 reload → sin parpadeo (server-first, SSR y cache coinciden)
- [x] Online → refocus pestaña → sin parpadeo (refetchOnFocus: false)
- [x] Offline → reload full → datos cacheados se muestran sin parpadeo
- [x] Offline → create → refresh → pago persiste (putPagoInCache)
- [x] Offline → update → refresh → cambio persiste (putPagoInCache)
- [x] Offline → delete → refresh → pago eliminado persiste (removePagoFromCache)
- [x] Offline → periodo no visitado → "Sin conexion" con botón Volver
- [x] Reconectar → auto-sync → barra desaparece → UI refleja cambios
- [x] DevTools → IndexedDB → mutation-queue entries / vacía tras sync
- [x] Actualizar SW → rebuild → preview → toast "Nueva versión disponible"
