import { getPeriodo } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { PagoType } from "db/schema"
import { deletePagoServer } from "server/pagos/delete-pago-server"
import { addMutationToQueue } from "@/lib/offline/db"

export function useDeletePago(pagoId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ data }: { data: { id: string } }) => {
			try {
				await deletePagoServer({ data })
			} catch {
				await addMutationToQueue("delete", data)
			}
		},
		onSuccess: () => {
			const [start, end] = getPeriodo(undefined, undefined)
			queryClient.removeQueries({ queryKey: queryKeys.pagos.byId(pagoId) })
			queryClient.setQueryData<PagoType[]>(queryKeys.pagos.byPeriodo(start, end), oldItems => {
				if (!oldItems) return oldItems
				return oldItems.filter(item => item.id !== pagoId)
			})
			queryClient.invalidateQueries({ queryKey: queryKeys.pagos.all, refetchType: "active" })
		},
	})
}
