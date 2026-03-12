import { queryOptions } from "@tanstack/react-query"
import { getRubrosServer } from "server/rubros/get-rubros-server"

export const rubrosQueryOptions = queryOptions({
	queryKey: ["rubros"],
	queryFn: () => getRubrosServer(),
	refetchInterval: 60 * 1000, // refrescar cada 60 segundos
})

// export const rubroQueryOptions = (itemId: string) => {
// 	const queryClient = useQueryClient()
// 	return queryOptions({
// 		queryKey: ["item", itemId],

// 		queryFn: () => getItemByIdServer({ data: { itemId } }), // BACKUP

// 		initialData: () => {
// 			const items = queryClient.getQueryData<ItemWithCategoryType[]>(["items"])
// 			return items?.find(item => item.id === itemId)
// 		},
// 	})
// }
