import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PagoFormType } from "db/pagos/pago-validator"
import { createPagoServer } from "server/pagos/create-pago-server"

export function useCreatePago() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createPagoServer,
		onSuccess: async data => {
			queryClient.setQueryData<PagoFormType[]>(["pagos"], oldPagos => {
				if (!oldPagos) return oldPagos
				const newPagos = [data, ...oldPagos]
				return newPagos
			})
		},
	})
}
