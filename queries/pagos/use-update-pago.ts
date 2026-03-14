import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PagoType } from "db/pagos/schema"
import { updatePagoServer } from "server/pagos/update-pago-server"

export function useUpdatePago() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: PagoType }) => updatePagoServer({ data }),
		onSuccess: data => {
			if (!data) return
			queryClient.setQueryData<PagoType[]>(["pagos"], oldPagos => {
				if (!oldPagos) return oldPagos
				const oldPago = oldPagos.find(oldPago => oldPago.id === data.id)
				if (!oldPago) return oldPagos
				return oldPagos.map(oldPago =>
					oldPago.id === data.id ? data : oldPago
				)
			})
			queryClient.setQueryData<PagoType>(["pago", data.id], data)
		},
	})
}
