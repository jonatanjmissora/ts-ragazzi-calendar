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
	getPendingCount,
	getCachedPagosByPeriodo,
	getCachedPagoById,
	putPagoInCache,
	getCachedPagos,
} from "@/lib/offline/db"
import { OfflineNoCacheError } from "@/lib/offline/errors"

const isClient = typeof window !== "undefined"

export const pagosQueryOptions = queryOptions({
	queryKey: queryKeys.pagos.all,
	queryFn: async ({ queryKey, client }) => {
		if (isClient) {
			const cached = await getCachedPagos()
			if (cached.length > 0) {
				getPagosServer()
					.then(async (data) => {
						const pending = await getPendingCount()
						console.log(
							"[offline-debug] pagosQueryOptions bg-sync | pending:",
							pending,
							"server length:",
							data.length
						)
						if (pending === 0) {
							client.setQueryData(queryKey, data)
						}
					})
					.catch(() => {})
				return cached
			}
		}
		try {
			const data = await getPagosServer()
			// No guardar en IndexedDB: las queries especificas
			// (pagosByPeriodo) se encargan del cache.
			return data
		} catch {
			throw new OfflineNoCacheError()
		}
	},
	staleTime: 60 * 1000,
	refetchInterval: 60 * 1000,
	networkMode: "always",
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

export const pagoQueryOptions = (itemId: string) =>
	queryOptions({
		queryKey: queryKeys.pagos.byId(itemId),
		queryFn: async ({ queryKey, client }) => {
			if (isClient) {
				const cached = await getCachedPagoById(itemId)
				if (cached) {
					getPagoByIdServer({ data: { id: itemId } })
						.then(async (data) => {
							const pending = await getPendingCount()
							if (data && pending === 0) {
								await putPagoInCache(data)
								client.setQueryData(queryKey, data)
							}
						})
						.catch(() => {})
					return cached
				}
			}
			try {
				const data = await getPagoByIdServer({ data: { id: itemId } })
				if (isClient && data) await putPagoInCache(data)
				return data
			} catch {
				throw new OfflineNoCacheError()
			}
		},
		networkMode: "always",
	})

export const pagosByPeriodoQueryOptions = (start: number, end: number) =>
	queryOptions({
		queryKey: queryKeys.pagos.byPeriodo(start, end),
		queryFn: async ({ queryKey, client }) => {
			if (isClient) {
				const cached = await getCachedPagosByPeriodo(start, end)
				if (cached.length > 0) {
					getPagosByPeriodoServer({ data: { start, end } })
						.then(async (data) => {
							const pending = await getPendingCount()
							console.log(
								"[offline-debug] pagosByPeriodo bg-sync | pending:",
								pending,
								"cached.length:",
								cached.length,
								"server.length:",
								data.length
							)
							if (pending === 0) {
								await savePagosByPeriodoToCache(start, end, data)
								client.setQueryData(queryKey, data)
							}
						})
						.catch(() => {})
					console.log(
						"[offline-debug] pagosByPeriodo RETURNING CACHED | len:",
						cached.length,
						"periodos:",
						cached.map((p) => p.periodo)
					)
					return cached
				}
			}
			console.log("[offline-debug] pagosByPeriodo NO CACHE → falling to server try")
			try {
				const data = await getPagosByPeriodoServer({ data: { start, end } })
				console.log(
					"[offline-debug] pagosByPeriodo server try OK | len:",
					data.length
				)
				if (isClient) await savePagosByPeriodoToCache(start, end, data)
				return data
			} catch {
				console.log("[offline-debug] pagosByPeriodo server try FAILED")
				throw new OfflineNoCacheError()
			}
		},
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000,
		networkMode: "always",
	})

export const pagosBySectorQueryOptions = (sector: string, rubro: string) =>
	queryOptions({
		queryKey: queryKeys.pagos.bySector(sector, rubro),
		queryFn: () => getPagosBySectorServer({ data: { sector, rubro } }),
	})
