import { useMutation, useQueryClient } from "@tanstack/react-query"
import { RubroFormType } from "db/rubros/rubro-validator"
import { createRubroServer } from "server/rubros/create-rubro-server"

export function useCreateRubro() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createRubroServer,
		onSuccess: async data => {
			queryClient.setQueryData<RubroFormType[]>(["rubros"], oldRubros => {
				if (!oldRubros) return oldRubros
				const newRubros = [data, ...oldRubros]
				return newRubros
			})
		},
	})
}
