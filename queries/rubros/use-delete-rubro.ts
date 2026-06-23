import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { RubroType } from "db/schema"
import { deleteRubroServer } from "server/rubros/delete-rubro-server"

export function useDeleteRubro(rubroId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: { id: string } }) =>
			deleteRubroServer({ data }),
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: queryKeys.rubros.byId(rubroId) })
			queryClient.setQueryData<RubroType[]>(queryKeys.rubros.all, oldItems => {
				if (!oldItems) return oldItems
				return oldItems.filter(item => item.id !== rubroId)
			})
			queryClient.invalidateQueries({ queryKey: queryKeys.rubros.all, refetchType: "active" })
		},
	})
}
