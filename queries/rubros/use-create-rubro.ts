import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { RubroFormType } from "db/rubros/rubro-validator"
import { createRubroServer } from "server/rubros/create-rubro-server"

export function useCreateRubro() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createRubroServer,
		onSuccess: async data => {
			queryClient.setQueryData<RubroFormType[]>(queryKeys.rubros.all, oldRubros => {
				if (!oldRubros) return oldRubros
				return [data, ...oldRubros]
			})
			queryClient.invalidateQueries({ queryKey: queryKeys.rubros.all, refetchType: "active" })
		},
	})
}
