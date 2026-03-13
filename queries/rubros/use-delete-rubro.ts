import { useMutation, useQueryClient } from "@tanstack/react-query"
import { RubroType } from "db/pagos/schema"
import { deleteRubroServer } from "server/rubros/delete-rubro-server"

export function useDeleteRubro(rubroId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: { id: string } }) =>
			deleteRubroServer({ data }),
		onSuccess: () => {
			queryClient.setQueryData<RubroType[]>(["rubros"], oldItems => {
				if (!oldItems) return oldItems
				return oldItems.filter(item => item.id !== rubroId)
			})
		},
	})
}
