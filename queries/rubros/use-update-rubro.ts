import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { RubroType } from "db/schema"
import { updateRubroServer } from "server/rubros/update-rubro-server"

export function useUpdateRubro() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: RubroType }) => updateRubroServer({ data }),
		onSuccess: data => {
			if (!data) return
			queryClient.setQueryData<RubroType>(queryKeys.rubros.byId(data.id), data)
			queryClient.setQueryData<RubroType[]>(queryKeys.rubros.all, oldRubros => {
				if (!oldRubros) return oldRubros
				return oldRubros.map(r => (r.id === data.id ? data : r))
			})
			queryClient.invalidateQueries({ queryKey: queryKeys.rubros.all, refetchType: "active" })
		},
	})
}
