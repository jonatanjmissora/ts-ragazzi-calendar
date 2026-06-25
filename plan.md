🔵 Performance / Arquitectura
24. Sin paginación en pagos — get-pagos-db.ts sin limit/offset.
25. defaultPendingMs: 0 — la UI muestra pending states instantáneamente sin umbral.
26. defaultPreloadStaleTime: 0 — los preloads se marcan como stale al instante.
27. Schema de rubros está en db/pagos/schema.ts en vez de db/rubros/schema.ts.

⚪ Features Faltantes / Misc
28. Sin migraciones visibles — drizzle.config.ts existe pero no hay carpeta drizzle/.
29. nitro versión nightly en package.json — riesgoso para producción.
30. Validación z.string().min(1) en vez de z.string().uuid() — inconsistente en updatePagoValidator.