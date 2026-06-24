import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { getPagoByIdServer } from "server/pagos/get-pago-by-id-server"
import { getPagosByPeriodoServer } from "server/pagos/get-pagos-by-periodo-server"
import { getPagosBySectorServer } from "server/pagos/get-pagos-by-sector-server"
import { getPagosServer } from "server/pagos/get-pagos-server"

export const pagosQueryOptions = queryOptions({
	queryKey: queryKeys.pagos.all,
	queryFn: () => getPagosServer(),
	staleTime: 60 * 1000,
	refetchInterval: 60 * 1000,
})

export const pagoQueryOptions = (itemId: string) =>
	queryOptions({
		queryKey: queryKeys.pagos.byId(itemId),
		queryFn: () => getPagoByIdServer({ data: { id: itemId } }),
	})

export const pagosByPeriodoQueryOptions = (start: number, end: number) =>
	queryOptions({
		queryKey: queryKeys.pagos.byPeriodo(start, end),
		queryFn: () => getPagosByPeriodoServer({ data: { start, end } }),
	})

export const pagosBySectorQueryOptions = (sector: string, rubro: string) =>
	queryOptions({
		queryKey: queryKeys.pagos.bySector(sector, rubro),
		queryFn: () => getPagosBySectorServer({ data: { sector, rubro } }),
	})
