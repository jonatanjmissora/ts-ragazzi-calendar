import { getPeriodo } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PagoFormType } from "db/pagos/pago-validator"
import { createPagoServer } from "server/pagos/create-pago-server"

export function useCreatePago() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createPagoServer,
		onSuccess: async data => {
			const [start, end] = getPeriodo(undefined, undefined)
			queryClient.setQueryData<PagoFormType[]>(["pagos-by-periodo", start, end], oldPagos => {
				if (!oldPagos) return oldPagos
				const newPagos = [data, ...oldPagos]
				return newPagos
			})
		},
	})
}
