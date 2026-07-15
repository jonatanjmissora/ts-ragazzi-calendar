# Stack Reference — TanStack + TailwindCSS + TypeScript + Better Auth + Drizzle

> Versiones basadas en `package.json` del proyecto. Siempre verificar `node_modules/` para la API exacta.

## React 19

```tsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { use, Suspense, lazy, startTransition, useOptimistic, useActionState } from "react"
```

- `use(promise)` — unwraps promise in render (con Suspense).
- `useActionState` — reemplaza `useFormState` para server actions.
- `startTransition` — marca actualizaciones como no urgentes.

## TypeScript 5.7

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## TailwindCSS v4

- Configuración vía CSS, no `tailwind.config.ts`.
- `@tailwindcss/vite` plugin en Vite.
- Sintaxis: `@import "tailwindcss"` en CSS principal.
- Variantes: `dark:`, `hover:`, `focus-visible:`, `data-*`.
- Uso: `className="flex gap-4 p-4 bg-zinc-900 text-white rounded-xl"`.
- Animaciones: `animate-spin`, `animate-pulse`, etc. via `tw-animate-css`.

## TanStack React Start v1.132+

```ts
import { createServerFn, createMiddleware } from "@tanstack/react-start"
```

### Server Function (GET)
```ts
export const getData = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getDataDb()
  }
)
```

### Server Function (POST con validación)
```ts
export const saveData = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; data: SomeType }) => d)
  .handler(async ({ data }) => {
    return await saveDataDb(data.id, data.data)
  })
```

### Middleware
```ts
import { createMiddleware } from "@tanstack/react-start"

const authMiddleware = createMiddleware({ type: "function" })
  .server(async ({ next }) => {
    const session = await getSession()
    if (!session) throw redirect({ to: "/" })
    return next({ context: { session } })
  })

export const protectedFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // context.session available
  })
```

### Request helpers
```ts
import { getRequest } from "@tanstack/react-start/server"
```

## TanStack React Router v1.132+

```ts
import { createFileRoute, createRouter, Link, useNavigate, useRouter } from "@tanstack/react-router"
import { linkOptions } from "@tanstack/react-router"
```

### Ruta de archivo
```ts
export const Route = createFileRoute("/ruta")({
  component: RouteComponent,
  loader: async () => { return data },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: ({ error }) => <div>Error</div>,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <div>{data}</div>
}
```

### Ruta raíz (__root.tsx)
```ts
export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

### Ruta anidada con layout
```ts
export const Route = createFileRoute("/_layout")({
  component: ({ children }) => <Layout><Outlet /></Layout>,
})
// Routes: /_layout/child.tsx → /child
```

### Search params tipados
```ts
const searchSchema = z.object({ page: z.number().default(1) })

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  component: Products,
})

// Uso: const { page } = Route.useSearch()
```

### Navegación
```ts
const navigate = useNavigate()
navigate({ to: "/path", params: { id: "123" }, search: { page: 1 } })

<Link to="/path/$id" params={{ id: "123" }} search={{ page: 1 }} />
```

### Router instance
```ts
const router = createRouter({
  routeTree,
  context: { queryClient, session: null },
  defaultPendingMs: 100,
  defaultPendingMinMs: 500,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 30_000,
  scrollRestoration: true,
})
```

### Server Function integration via `setupRouterSsrQueryIntegration`
```ts
setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })
```

### Auth redirect en ruta protegida
⚠️ `throw redirect()` funciona en **`beforeLoad`** pero **NO** en `loader`. Usar `beforeLoad` para auth guards.

```ts
export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" })
    }
  },
  loader: async ({ context }) => {
    // redirect aquí NO funcionaría
    context.queryClient.prefetchQuery(dataQueryOptions)
  },
})
```

## TanStack React Query v5.66+

```ts
import { useQuery, useSuspenseQuery, useMutation, useQueryClient, queryOptions, infiniteQueryOptions } from "@tanstack/react-query"
import { usePrefetchQuery } from "@tanstack/react-query"
```

### useSuspenseQuery (recomendado con Suspense)
```ts
const { data } = useSuspenseQuery({
  queryKey: ["key", param],
  queryFn: () => fetchFn(param),
})
// data NO es undefined (siempre definido)
```

### useQuery
```ts
const { data, isLoading, error } = useQuery({
  queryKey: ["key", param],
  queryFn: () => fetchFn(param),
  staleTime: 1000 * 60 * 5,
  enabled: !!param,
})
```

### useMutation
```ts
const mutation = useMutation({
  mutationFn: (data: Input) => saveToServer(data),
  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["key"] }) },
})

mutation.mutate({ name: "test" })
```

### queryOptions (factory tipada)
```ts
export const postOptions = (id: string) => queryOptions({
  queryKey: ["post", id],
  queryFn: () => fetchPost(id),
})
```

### QueryClientProvider setup
```tsx
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query"
```

### Prefetching
```ts
usePrefetchQuery({ queryKey: ["key"], queryFn: () => fetchData() })
```

## TanStack React Form v1.0+

```ts
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
```

### Formulario básico
```ts
const form = useForm({
  defaultValues: { name: "", email: "" },
  validators: { onChange: z.object({...}) },
  onSubmit: async ({ value }) => { await submit(value) },
})
```

### Field pattern
```tsx
<form.Field name="email" children={(field) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <div>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
      />
      {isInvalid && <span>{field.state.meta.errors.join(", ")}</span>}
    </div>
  )
}} />
```

Submit: `form.handleSubmit()` (llamado desde `onSubmit` del `<form>` con `e.preventDefault()`).

## Better Auth v1.4+

### Server
```ts
import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId: "...", clientSecret: "..." },
  },
  plugins: [tanstackStartCookies()],
  database: drizzleAdapter(db, { provider: "pg", schema: { user, account, session, verification } }),
})
```

### Cliente
```ts
import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_BASE_URL,
})

// Sign up/in
await authClient.signUp.email({ email, password, name, callbackURL: "/" })
await authClient.signIn.email({ email, password, callbackURL: "/" })
await authClient.signIn.social({ provider: "google", callbackURL: "/" })

// Session
await authClient.getSession()
await authClient.signOut()
```

### Server-side session
```ts
const request = getRequest()
const session = await auth.api.getSession({ headers: request.headers })
```

## Drizzle ORM v0.45+

```ts
import { pgTable, text, jsonb, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core"
import { eq, and, or, sql, asc, desc, ilike, inArray, isNull, isNotNull } from "drizzle-orm"
```

### Schema
```ts
export const table = pgTable("table_name", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: jsonb("data").$type<SomeType>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
})
```

### CRUD
```ts
import { db } from "../index"
import { table } from "../schema"

// Read
await db.select().from(table).where(eq(table.id, id))

// Create
await db.insert(table).values({ id, name, data })

// Update
await db.update(table).set({ name }).where(eq(table.id, id))

// Delete
await db.delete(table).where(eq(table.id, id))

// Filtros compuestos
await db.select().from(table).where(and(eq(table.id, id), isNotNull(table.name)))
await db.select().from(table).where(ilike(table.name, `%${query}%`))

// Orden
await db.select().from(table).orderBy(asc(table.name))

// Joins
await db.select().from(table).leftJoin(otherTable, eq(table.id, otherTable.tableId))
```

### Adapters
```ts
import { drizzle } from "drizzle-orm/node-postgres"    // Servidor Node
import { drizzle } from "drizzle-orm/neon-http"        // Neon serverless
```

Conexión: `drizzle(process.env.DATABASE_URL as string, { schema })`.

---

## Best practices

- Usar `useSuspenseQuery` en lugar de `useQuery` para evitar checks de `undefined` en `data`.
- Server Functions con `inputValidator` para validación tipada antes del handler.
- Middleware con `createMiddleware` para auth reutilizable.
- Formularios con `@tanstack/react-form` + Zod + UI components.
- Drizzle: `db.update()` con `$onUpdate()` auto-maneja `updatedAt`.
- Tailwind v4: usar `@import "tailwindcss"` en CSS, no config file.
- Las rutas TanStack Router son lazy-load por defecto.

## Offline-first con IndexedDB + React Query

### queryOptions (lectura offline)
```ts
export const entitiesQueryOptions = queryOptions({
  queryKey: ["entities"],
  queryFn: async () => {
    if (typeof window !== "undefined") {
      // Server-first online: datos frescos, sin flicker post-SSR
      if (navigator.onLine) {
        try {
          const data = await getEntitiesServer()
          await saveListToCache(data)
          return sortEntities(data)
        } catch {}
      }
      // Cache-fallback offline: salta red, usa IDB directo
      const cached = await getCachedList()
      if (cached.length > 0) return sortEntities(cached)
      if (!navigator.onLine) throw new OfflineNoCacheError()
    }
    const data = await getEntitiesServer()
    return data
  },
  refetchOnMount: "always",
  refetchOnFocus: false,
  refetchOnReconnect: false,
  networkMode: "always",
})
```

### useMutation (escritura offline)
```ts
mutationFn: async ({ data }) => {
  try { return await createServer({ data }) }
  catch {
    const entity = { ...data, id: crypto.randomUUID() }
    await addMutationToQueue("create", entity)
    await putEntityInCache(entity) // ⚠️ OBLIGATORIO — si no, el dato offline se pierde al refrescar
    return entity
  }
}
```

### Reglas clave
1. **queryFn**: server-first cuando `navigator.onLine` (sin cache intermedio, sin bg sync). Cache-fallback solo cuando offline o si el server falla estando online.
2. **`refetchOnFocus: false`** y **`refetchOnReconnect: false`** — evitar refetches automáticos que causan flicker. Solo se refetchea en montaje (`refetchOnMount: "always"`) o por invalidación de mutations.
3. **`saveEntityListToCache` con rango**: usar índice secundario con `cursor.delete()`, NO `store.delete(range)` — la primary key suele ser UUID y el rango numérico no matchea.
4. **Sin staleTime/refetchInterval** para usuario único — los datos solo mutan por él. `refetchOnMount: "always"` fuerza queryFn post-SSR hydration.
5. **Formularios inline** con try/catch propio deben incluir `putEntityInCache(entity)` en el catch, igual que los hooks centralizados.
6. **`removeEntityFromCache`** en catch de delete mutation — el `onSuccess` solo actualiza React Query, no IDB.
7. **SW `/_serverFn/` network-only** — las server functions deben saltar el SW (`return;` en fetch handler). El cache offline ya lo maneja IndexedDB en el queryFn, no necesita cache del SW.
8. **Orden consistente**: tanto server como cache deben ordenar igual. Usar helper `sortEntities()` y aplicar el mismo `ORDER BY` en la DB query.

### OfflineNoCacheError (error boundary)

```ts
export class OfflineNoCacheError extends Error {
  constructor() { super("No hay datos en caché ni conexión"); this.name = "OfflineNoCacheError" }
}

export function isOfflineNoCacheError(error: unknown): boolean {
  if (error instanceof OfflineNoCacheError) return true
  if (error && typeof error === "object" && "name" in error) {
    return (error as { name: string }).name === "OfflineNoCacheError"
  }
  return false
}
```

### ErrorComponent raíz con offline check

En `__root.tsx`:
```tsx
errorComponent: ({ error }) => {
  if (isOfflineNoCacheError(error)) {
    return <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
      <WifiOff className="w-16 h-16 text-muted-foreground" />
      <h2 className="text-2xl font-bold">Sin conexión</h2>
      <p className="text-muted-foreground max-w-md">... y no hay datos guardados.</p>
    </div>
  }
  return <DefaultCatchBoundary /> // fall through para otros errores
}
```

### Sync: evitar duplicados offline→online

`updatePagosCache` debe recibir el `payload` original (con UUID offline) y filtrarlo antes de agregar el resultado del server:

```ts
function updatePagosCache(key: string[], payload?: { id: string }) {
  queryClient.setQueryData(key, (old: unknown) => {
    if (!Array.isArray(old)) return old
    let list = [...old]
    // filtrar UUID offline en create type
    if (payload?.id?.startsWith?.("offline-")) {
      list = list.filter((p: Pago) => p.id !== payload.id)
    }
    list.push(serverResult)
    return sortPagos(list)
  })
}
```

### beforeLoad: preservar sesión offline

```ts
beforeLoad: async ({ context }) => {
  const [theme, session] = await Promise.all([
    getThemeServerFn().then(t => t ?? "auto").catch(() => "auto"),
    getSession().catch(() => null),
  ])
  return {
    theme,
    session: session ?? (typeof document !== "undefined" && !navigator.onLine ? context.session : null),
  }
}
```

### Admin route: offline guard con redirect + session de context

```ts
export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context }) => {
    if (typeof document !== "undefined" && !navigator.onLine) {
      throw redirect({ to: "/" })
    }
    if (!context.session) throw redirect({ to: "/" })
  },
})
```

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
