import { queryOptions } from "@tanstack/react-query"
import { getPagosServer } from "server/pagos/get-pagos-server"

export const pagosQueryOptions = queryOptions({
	queryKey: ["pagos"],
	queryFn: () => getPagosServer(),
	refetchInterval: 60 * 1000, // refrescar cada 60 segundos
})
