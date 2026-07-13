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
	getCachedPagos,
	getCachedPagosBySector,
	saveAllPagosToCache,
} from "@/lib/offline/db"
import { OfflineNoCacheError } from "@/lib/offline/errors"
import type { PagoType } from "db/pagos/schema"

const isClient = typeof window !== "undefined"

export function sortPagos(pagos: PagoType[]) {
	return pagos.sort(
		(a, b) =>
			b.periodo - a.periodo || a.rubro.localeCompare(b.rubro) || a.sector.localeCompare(b.sector)
	)
}

export const pagosQueryOptions = queryOptions({
	queryKey: queryKeys.pagos.all,
	queryFn: async () => {
		if (isClient) {
			if (navigator.onLine) {
				try {
					const data = await getPagosServer()
					await saveAllPagosToCache(data)
					return data
				} catch {}
			}
			const cached = await getCachedPagos()
			if (cached.length > 0) return sortPagos(cached)
			if (!navigator.onLine) throw new OfflineNoCacheError()
			try {
				return await getPagosServer()
			} catch {
				const cached2 = await getCachedPagos()
				if (cached2.length > 0) return sortPagos(cached2)
				throw new OfflineNoCacheError()
			}
		}
		return await getPagosServer()
	},
	refetchOnMount: "always",
	refetchOnFocus: false,
	refetchOnReconnect: false,
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
		queryFn: async () => {
			if (isClient) {
				if (navigator.onLine) {
					try {
						const data = await getPagoByIdServer({ data: { id: itemId } })
						if (data) await putPagoInCache(data)
						return data
					} catch {}
				}
				const cached = await getCachedPagoById(itemId)
				if (cached) return cached
				if (!navigator.onLine) throw new OfflineNoCacheError()
				try {
					return await getPagoByIdServer({ data: { id: itemId } })
				} catch {
					const cached2 = await getCachedPagoById(itemId)
					if (cached2) return cached2
					throw new OfflineNoCacheError()
				}
			}
			return await getPagoByIdServer({ data: { id: itemId } })
		},
		refetchOnMount: "always",
		refetchOnFocus: false,
		refetchOnReconnect: false,
		networkMode: "always",
	})

export const pagosByPeriodoQueryOptions = (start: number, end: number) =>
	queryOptions({
		queryKey: queryKeys.pagos.byPeriodo(start, end),
		queryFn: async () => {
			if (isClient) {
				if (navigator.onLine) {
					try {
						const data = await getPagosByPeriodoServer({ data: { start, end } })
						await savePagosByPeriodoToCache(start, end, data)
						return sortPagos(data)
					} catch {}
				}
				const cached = await getCachedPagosByPeriodo(start, end)
				if (cached.length > 0) return sortPagos(cached)
				if (!navigator.onLine) throw new OfflineNoCacheError()
				try {
					const data = await getPagosByPeriodoServer({ data: { start, end } })
					return sortPagos(data)
				} catch {
					const cached2 = await getCachedPagosByPeriodo(start, end)
					if (cached2.length > 0) return sortPagos(cached2)
					throw new OfflineNoCacheError()
				}
			}
			const data = await getPagosByPeriodoServer({ data: { start, end } })
			return sortPagos(data)
		},
		refetchOnMount: "always",
		refetchOnFocus: false,
		refetchOnReconnect: false,
		networkMode: "always",
	})

export const pagosBySectorQueryOptions = (sector: string, rubro: string) =>
	queryOptions({
		queryKey: queryKeys.pagos.bySector(sector, rubro),
		queryFn: async () => {
			if (isClient) {
				if (navigator.onLine) {
					try {
						const data = await getPagosBySectorServer({ data: { sector, rubro } })
						return data
					} catch {}
				}
				const cached = await getCachedPagosBySector(sector, rubro)
				if (cached.length > 0) return cached
				if (!navigator.onLine) throw new OfflineNoCacheError()
				try {
					return await getPagosBySectorServer({ data: { sector, rubro } })
				} catch {
					const cached2 = await getCachedPagosBySector(sector, rubro)
					if (cached2.length > 0) return cached2
					throw new OfflineNoCacheError()
				}
			}
			return await getPagosBySectorServer({ data: { sector, rubro } })
		},
		refetchOnMount: "always",
		refetchOnFocus: false,
		refetchOnReconnect: false,
		networkMode: "always",
	})
