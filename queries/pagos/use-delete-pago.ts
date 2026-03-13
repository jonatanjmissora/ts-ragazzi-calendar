import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PagoType } from "db/pagos/schema"
import { deletePagoServer } from "server/pagos/delete-pago-server"

export function useDeletePago(pagoId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: { id: string } }) =>
			deletePagoServer({ data }),
		onSuccess: () => {
			queryClient.setQueryData<PagoType[]>(["pagos"], oldItems => {
				if (!oldItems) return oldItems
				return oldItems.filter(item => item.id !== pagoId)
			})
		},
	})
}
