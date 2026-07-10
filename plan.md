# Plan Offline + PWA — ts-ragazzi-calendar (Dashboard `/`)

> Referencia: [`offline-pwa`](.opencode/skills/offline-pwa/SKILL.md) — patrón genérico con código completo y gotchas.
>
> Offline solo aplica al dashboard `/` (pagos pendientes por periodo + CRUD).
> El área `/admin` (rubros, links, pagos admin) y el histograma no tienen implementación offline.

---

## ✅ Completado

### Setup
- [x] `public/sw.js` con 3 estrategias (network-first API, network-first navigation con fallback offline.html, cache-first assets) + `SKIP_WAITING`
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
- [x] Write-through a `pagos-cache` en IDB al recibir datos del server (solo periodos visitados online se cachean)
- [x] Fallback a `getCachedPagosByPeriodo` si el server falla (offline)
- [x] Si no hay cache para ese periodo → `OfflineNoCacheError` → `errorComponent` muestra `<OfflineRouteBlock />` con botón Volver a `/`
- [x] `pagoQueryOptions(itemId)` con `networkMode: "always"` — carga datos del pago a editar con mismo patrón write-through + fallback + `OfflineNoCacheError`

### Lectura offline — rubros (dashboard edit-pago)
- [x] `rubros-cache` store en IndexedDB v4
- [x] `rubrosQueryOptions` con `networkMode: "always"`, write-through a IDB en éxito, fallback a `getCachedRubros`, lanza `OfflineNoCacheError` si vacío
- [x] `saveRubrosToCache` / `getCachedRubros` en `db.ts`

### Mutaciones offline — CRUD pagos (dashboard)
- [x] `useCreatePago` — `useMutation` con try/catch → `addMutationToQueue("create", ...)` + `putPagoInCache`
- [x] `useUpdatePago` — `useMutation` con try/catch → `addMutationToQueue("update", ...)` + `putPagoInCache`
- [x] `useDeletePago` — `useMutation` con try/catch → `addMutationToQueue("delete", ...)` + `removePagoFromCache`
- [x] `create-pago.tsx` — llama `createPagoServer` directo, catch offline → `addMutationToQueue`
- [x] `check-pago-form.tsx` — llama `updatePagoServer` directo, catch offline → `addMutationToQueue`
- [x] `pagos-delete.tsx` — llama `deletePagoServer` directo, catch offline → `addMutationToQueue` + `removePagoFromCache`
- [x] `sync.ts: processMutationQueue` — al vaciar cola actualiza cache React Query con `setQueryData` (sin refetch)
- [x] `root-provider.tsx` — `refetchOnReconnect: true`

### Theme (offline-compatible)
- [x] Theme switch con cookie-based persistence via server functions
- [x] `ScriptOnce` para FOUC prevention
- [x] `suppressHydrationWarning` en `<html>`
- [x] `useState("auto")` + `useEffect` post-hydration sync

---

## 🚧 Verificación

- [ ] Offline → dashboard muestra pagos cacheados del periodo
- [ ] Offline → periodo no visitado → muestra "Sin conexion" con botón Volver
- [ ] Offline → crear/editar/eliminar pago → barra muestra pendientes
- [ ] Reconectar → auto-sync → barra desaparece → UI refleja cambios
- [ ] DevTools → IndexedDB → mutation-queue entries / vacía tras sync
- [ ] Actualizar SW → rebuild → preview → toast "Nueva versión disponible"
