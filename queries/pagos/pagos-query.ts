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
} from "@/lib/offline/db"
import { OfflineNoCacheError } from "@/lib/offline/errors"
import type { PagoType } from "db/pagos/schema"

const isClient = typeof window !== "undefined"

function sortPagos(pagos: PagoType[]) {
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
					return data
				} catch {}
			}
			const cached = await getCachedPagos()
			if (cached.length > 0) return cached
			if (!navigator.onLine) throw new OfflineNoCacheError()
		}
		const data = await getPagosServer()
		return data
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
			}
			const data = await getPagoByIdServer({ data: { id: itemId } })
			return data
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
		queryFn: () => getPagosBySectorServer({ data: { sector, rubro } }),
	})
