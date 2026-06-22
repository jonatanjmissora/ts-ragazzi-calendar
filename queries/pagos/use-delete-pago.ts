import { getPeriodo } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PagoType } from "db/pagos/schema"
import { deletePagoServer } from "server/pagos/delete-pago-server"

export function useDeletePago(pagoId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: { id: string } }) =>
			deletePagoServer({ data }),
		onSuccess: () => {
			const [start, end] = getPeriodo(undefined, undefined)
			queryClient.setQueryData<PagoType[]>(["pagos-by-periodo", start, end], oldItems => {
				if (!oldItems) return oldItems
				return oldItems.filter(item => item.id !== pagoId)
			})
		},
	})
}
