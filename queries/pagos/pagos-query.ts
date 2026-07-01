import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { getPagoByIdServer } from "server/pagos/get-pago-by-id-server"
import { getPagosByPeriodoServer } from "server/pagos/get-pagos-by-periodo-server"
import { getPagosBySectorServer } from "server/pagos/get-pagos-by-sector-server"
import { getPagosServer } from "server/pagos/get-pagos-server"
import { getPagosPageServer } from "server/pagos/get-pagos-page-server"
import type { PagosFilter } from "db/pagos/get-pagos-db"
import {
	savePagosByPeriodoToCache,
	getCachedPagosByPeriodo,
	getCachedPagoById,
	putPagoInCache,
} from "@/lib/offline/db"
import { OfflineNoCacheError } from "@/lib/offline/errors"

export const pagosQueryOptions = queryOptions({
	queryKey: queryKeys.pagos.all,
	queryFn: () => getPagosServer(),
	staleTime: 60 * 1000,
	refetchInterval: 60 * 1000,
})

export const pagosPageQueryOptions = (
	page: number,
	pageSize: number,
	filter: PagosFilter
) =>
	queryOptions({
		queryKey: queryKeys.pagos.byPage(page, pageSize, filter),
		queryFn: () =>
			getPagosPageServer({
				data: { page, pageSize, ...filter },
			}),
	})

const isClient = typeof window !== "undefined"

/**
 * Lee un pago por id. Online lo pide al server y queda cacheado por-entidad en
 * IndexedDB; offline sirve el cache. Si nunca se visito online, lanza
 * OfflineNoCacheError para que la ruta muestre el bloque offline.
 */
export const pagoQueryOptions = (itemId: string) =>
	queryOptions({
		queryKey: queryKeys.pagos.byId(itemId),
		queryFn: async () => {
			try {
				const data = await getPagoByIdServer({ data: { id: itemId } })
				// Solo cachear en el cliente; IndexedDB no existe en SSR.
				if (isClient && data) {
					await putPagoInCache(data)
				}
				return data
			} catch {
				// SSR no tiene cache: si el server fallo, no hay fallback.
				if (!isClient) throw new OfflineNoCacheError()
				const cached = await getCachedPagoById(itemId)
				if (!cached) throw new OfflineNoCacheError()
				return cached
			}
		},
		networkMode: "always",
	})

/**
 * Pagos por periodo (alimenta el dashboard de pendientes/realizados).
 * Online pide al server y cachea el rango en IndexedDB; offline sirve el cache.
 * Si nunca se visito ese periodo online, lanza OfflineNoCacheError.
 */
export const pagosByPeriodoQueryOptions = (start: number, end: number) =>
	queryOptions({
		queryKey: queryKeys.pagos.byPeriodo(start, end),
		queryFn: async () => {
			try {
				const data = await getPagosByPeriodoServer({ data: { start, end } })
				// Solo cachear en el cliente; IndexedDB no existe en SSR.
				if (isClient) {
					await savePagosByPeriodoToCache(start, end, data)
				}
				return data
			} catch {
				// SSR no tiene cache: si el server fallo, no hay fallback.
				if (!isClient) throw new OfflineNoCacheError()
				const cached = await getCachedPagosByPeriodo(start, end)
				if (cached.length === 0) throw new OfflineNoCacheError()
				return cached
			}
		},
		networkMode: "always",
	})

export const pagosBySectorQueryOptions = (sector: string, rubro: string) =>
	queryOptions({
		queryKey: queryKeys.pagos.bySector(sector, rubro),
		queryFn: () => getPagosBySectorServer({ data: { sector, rubro } }),
	})
