import { queryOptions, useQueryClient } from "@tanstack/react-query"
import { PagoType } from "db/pagos/schema"
import { getPagoByIdServer } from "server/pagos/get-pago-by-id-server"
import { getPagosByPeriodoServer } from "server/pagos/get-pagos-by-periodo-server"
import { getPagosServer } from "server/pagos/get-pagos-server"

export const pagosQueryOptions = queryOptions({
	queryKey: ["pagos"],
	queryFn: () => getPagosServer(),
	refetchInterval: 60 * 1000, // refrescar cada 60 segundos
})

export const pagoQueryOptions = (itemId: string) => {
	const queryClient = useQueryClient()
	return queryOptions({
		queryKey: ["item", itemId],

		queryFn: () => getPagoByIdServer({ data: { id: itemId } }),

		initialData: () => {
			const items = queryClient.getQueryData<PagoType[]>(["pagos"])
			return items?.find(item => item.id === itemId)
		},
	})
}

export const pagosByPeriodoQueryOptions = queryOptions({
	queryKey: ["pagos-by-periodo"],
	queryFn: () => getPagosByPeriodoServer(),
	refetchInterval: 60 * 1000, // refrescar cada 60 segundos
})
