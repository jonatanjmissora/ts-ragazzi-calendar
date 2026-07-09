---
name: tanstack-start-theme
description: "Use when implementing dark/light/system theme toggling in a TanStack Start app with SSR, hydration safety, and no FOUC. Covers cookie-based persistence, ScriptOnce, suppressHydrationWarning, and the full implementation pattern."
---

# tanstack-start-theme

Implementación de tema (light/dark/auto) para TanStack Start con SSR, cero FOUC, y sin errores de hidratación.

## Cuándo usar este skill

- Cuando se pide dark mode, theme toggle, light/dark/system en TanStack Start
- Cuando hay problemas de hidratación o FOUC con el tema
- Cuando el theme toggle funciona solo 1 vez (síntoma clásico de hydration mismatch)
- Cuando se necesita elegir entre cookies vs localStorage para persistir el tema

---

## Stack requerido

| Paquete | Rol |
|---------|-----|
| `@tanstack/react-router` v1+ | `ScriptOnce` para inline script SSR que previene FOUC |
| `@tanstack/react-start` | Server Functions para leer/escribir cookie de tema |
| `lucide-react` o similar | Iconos para el toggle |
| TailwindCSS v4 | `@custom-variant dark` para modo oscuro con clases `.dark` y `.auto` |

Sin dependencias nuevas — todo viene con TanStack Start + TailwindCSS.

---

## Arquitectura

```
Cookie (app-theme)  ←→  ScriptOnce (pre-hydration)  →  <html className="dark|light|auto">
       ↑                        ↓
  getThemeServerFn        useState("auto") + useEffect sync
  (SSR beforeLoad)         (post-hydration)
       ↓                        ↓
  RouteContext          ThemeSwitch component
  (opcional)            (DOM + document.cookie directo)
```

### Decisiones clave

- **Cookie en vez de localStorage**: el servidor necesita conocer el tema durante SSR para el inline script. localStorage no es accesible desde el server. La cookie viaja en cada request y el server la lee con `getCookie()`.
- **Server function para persistir**: el toggle usa `setThemeServerFn({ data: next })` para setear la cookie server-side vía POST. Esto evita manipular `document.cookie` directamente y mantiene la cookie manejada por el servidor.
- **`ScriptOnce` en vez de `scripts: [{ children }]`**: `ScriptOnce` solo se renderiza en SSR y se autodestruye (`document.currentScript.remove()`). No hay riesgo de re-ejecución en navegación SPA.
- **`suppressHydrationWarning`**: necesario en `<html>` porque `ScriptOnce` muta el DOM antes de que React hidrate, creando diferencias entre el HTML del servidor y el DOM del cliente.
- **`useState("auto")` + `useEffect`**: el estado inicial DEBE ser el mismo en server y cliente para evitar hydration mismatch. El `useEffect` post-hidratación lee la clase real del DOM (ya seteada por `ScriptOnce`) y actualiza el icono.

---

## Implementación

### 1. Server Functions (`server/theme.ts`)

```ts
import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import z from "zod"

const storageKey = "app-theme"
const themeValidator = z.enum(["light", "dark", "auto"])

export const getThemeServerFn = createServerFn({ method: "GET" }).handler(() => {
	const theme = getCookie(storageKey)
	return theme ? themeValidator.parse(theme) : "auto"
})

export const setThemeServerFn = createServerFn({ method: "POST" })
	.inputValidator(themeValidator)
	.handler(({ data }) => {
		setCookie(storageKey, data, {
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		})
	})
```

### 2. Root Layout (`routes/__root.tsx`)

```tsx
import { createRootRouteWithContext, HeadContent, ScriptOnce, Scripts } from "@tanstack/react-router"

const THEME_SCRIPT = `var t=(document.cookie.match(/(?:^|;\\s*)app-theme=(\\w+)/)?.[1]||"auto");document.documentElement.className=t+" w-screen overflow-x-hidden min-h-screen"`

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es" suppressHydrationWarning>
			<head>
				<HeadContent />
				<ScriptOnce>{THEME_SCRIPT}</ScriptOnce>
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	)
}
```

Puntos clave:
- `<html suppressHydrationWarning>` — React ignora diferencias de atributos
- `ScriptOnce` dentro de `<head>` — el script se inyecta en SSR, se ejecuta antes de la primera paint, y se autodestruye
- Sin `className` controlado por React en `<html>` — React nunca toca el class del html

### 3. ThemeSwitch Component

```tsx
import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"

const THEMES = ["light", "dark", "auto"] as const

export default function ThemeSwitch() {
	const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto")
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		const c = document.documentElement.className
		const t = c.includes("dark") ? "dark" : c.includes("light") ? "light" : "auto"
		setTheme(t)
		setMounted(true)
	}, [])

	const toggleTheme = () => {
		const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
		setTheme(next)
		document.documentElement.className = `${next} w-screen overflow-x-hidden min-h-screen`
		setThemeServerFn({ data: next })
	}

	return (
		<button aria-label="Toggle theme" className="cursor-pointer" onClick={toggleTheme}>
			<span className={mounted ? "" : "invisible"}>
				{theme === "dark" ? <Moon size={20} /> : theme === "light" ? <Sun size={20} /> : <Monitor size={20} />}
			</span>
		</button>
	)
}
```

Puntos clave:
- `useState("auto")` — valor fijo, coincide con server → NO hydration mismatch
- `useEffect` post-hidratación — lee la clase real del DOM (ya seteada por ScriptOnce)
- `mounted` state — oculta el icono hasta después del useEffect para evitar flash de "auto" → correcto
- `document.cookie` directo — sin llamada al servidor, evita revalidación del router
- `className` completo — incluye clases utilitarias (w-screen, etc.) para mantenerlas

### 4. CSS Tailwind v4

```css
@custom-variant dark {
  &:is(.dark *) {
    @slot;
  }
  @media (prefers-color-scheme: dark) {
    &:is(.auto *) {
      @slot;
    }
  }
}

:root { /* light theme variables */ }
.dark { /* dark theme variables */ }
@media (prefers-color-scheme: dark) {
  :root:is(.auto) { /* auto-dark theme variables */ }
}
```

---

## Pipeline completo

1. **SSR**: `ScriptOnce` inyecta `<script>` que lee cookie y setea `className` en `<html>` antes de la primera paint
2. **Paint**: el usuario ve el tema correcto desde el inicio (sin FOUC)
3. **Hydration**: React hidrata, `useState("auto")` coincide con server → sin hydration mismatch
4. **Post-hydration**: `useEffect` lee `document.documentElement.className` y actualiza el icono
5. **Toggle**: click → `setTheme()` + DOM directo + `document.cookie` — todo síncrono, sin servidor
6. **Refresh**: el server lee la cookie vía `getThemeServerFn` en `beforeLoad` (o el ScriptOnce la lee directamente)

---

## Problemas conocidos y soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| Theme toggle funciona solo 1 vez | Hydration mismatch: server renderiza Monitor (auto), cliente renderiza Sun/Moon (porque ScriptOnce ya cambió el DOM) | `useState("auto")` fijo + `useEffect` post-hidratación |
| FOUC (flash del tema incorrecto) | React aplica el tema después de hidratar, no antes | `ScriptOnce` con script inline que corre antes de la primera paint |
| Icono incorrecto en primera paint | `useState` lee del DOM client-side, pero server usó default | `mounted` state + `invisible` class hasta después del useEffect |
| Toggle llama al servidor y rompe | `setThemeServerFn` POST trigger ea revalidación del router | Usar `document.cookie` directo, no server function en el toggle |
| React controla className del `<html>` | `className` prop en `<html>` causa re-renders | NO poner `className` en `<html>`, solo `suppressHydrationWarning` |

---

## Referencias

- [`src/components/layout/theme-switch.tsx`](../src/components/layout/theme-switch.tsx)
- [`src/routes/__root.tsx`](../src/routes/__root.tsx)
- [`server/theme.ts`](../server/theme.ts)
- [`src/styles.css`](../src/styles.css)
- Artículo base: https://dev.to/tigawanna/tanstack-start-ssr-friendly-theme-provider-5gee
- shadcn/ui TanStack Start dark mode: https://ui.shadcn.com/docs/dark-mode/tanstack-start
- Leonardo Montini approach: https://leonardomontini.dev/tanstack-start-theme/
