import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { getRubroByIdServer } from "server/rubros/get-rubro-by-id-server"
import { getRubrosServer } from "server/rubros/get-rubros-server"

export const rubrosQueryOptions = queryOptions({
	queryKey: queryKeys.rubros.all,
	queryFn: () => getRubrosServer(),
	staleTime: 60 * 1000,
	refetchInterval: 60 * 1000,
})

export const rubroQueryOptions = (itemId: string) =>
	queryOptions({
		queryKey: queryKeys.rubros.byId(itemId),
		queryFn: () => getRubroByIdServer({ data: { id: itemId } }),
	})
