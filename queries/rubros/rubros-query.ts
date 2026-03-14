import { queryOptions, useQueryClient } from "@tanstack/react-query"
import { RubroType } from "db/pagos/schema"
import { getRubroByIdServer } from "server/rubros/get-rubro-by-id-server"
import { getRubrosServer } from "server/rubros/get-rubros-server"

export const rubrosQueryOptions = queryOptions({
	queryKey: ["rubros"],
	queryFn: () => getRubrosServer(),
	refetchInterval: 60 * 1000, // refrescar cada 60 segundos
})

export const rubroQueryOptions = (itemId: string) => {
	const queryClient = useQueryClient()
	return queryOptions({
		queryKey: ["item", itemId],

		queryFn: () => getRubroByIdServer({ data: { id: itemId } }),

		initialData: () => {
			const items = queryClient.getQueryData<RubroType[]>(["rubros"])
			return items?.find(item => item.id === itemId)
		},
	})
}
