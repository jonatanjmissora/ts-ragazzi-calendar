import { useMutation, useQueryClient } from "@tanstack/react-query"
import { RubroType } from "db/pagos/schema"
import { updateRubroServer } from "server/rubros/update-rubro-server"

export function useUpdateRubro() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: RubroType }) => updateRubroServer({ data }),
		onSuccess: data => {
			if (!data) return
			queryClient.setQueryData<RubroType[]>(["rubros"], oldRubros => {
				if (!oldRubros) return oldRubros
				const oldRubro = oldRubros.find(oldRubro => oldRubro.id === data.id)
				if (!oldRubro) return oldRubros
				return oldRubros.map(oldRubro =>
					oldRubro.id === data.id ? data : oldRubro
				)
			})
			queryClient.setQueryData<RubroType>(["rubro", data.id], data)
		},
	})
}
