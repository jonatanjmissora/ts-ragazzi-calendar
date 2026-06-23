import { getPeriodo } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { PagoFormType } from "db/pagos/pago-validator"
import { createPagoServer } from "server/pagos/create-pago-server"

export function useCreatePago() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createPagoServer,
		onSuccess: async data => {
			const [start, end] = getPeriodo(undefined, undefined)
			queryClient.setQueryData<PagoFormType[]>(queryKeys.pagos.byPeriodo(start, end), oldPagos => {
				if (!oldPagos) return oldPagos
				return [data, ...oldPagos]
			})
			queryClient.invalidateQueries({ queryKey: queryKeys.pagos.all, refetchType: "active" })
		},
	})
}
