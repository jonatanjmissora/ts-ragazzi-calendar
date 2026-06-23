import { getPeriodo } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { PagoType } from "db/schema"
import { updatePagoServer } from "server/pagos/update-pago-server"

export function useUpdatePago() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: PagoType }) => updatePagoServer({ data }),
		onSuccess: data => {
			if (!data) return
			const [start, end] = getPeriodo(undefined, undefined)
			queryClient.setQueryData<PagoType>(queryKeys.pagos.byId(data.id), data)
			queryClient.setQueryData<PagoType[]>(queryKeys.pagos.byPeriodo(start, end), oldPagos => {
				if (!oldPagos) return oldPagos
				return oldPagos.map(p => (p.id === data.id ? data : p))
			})
			queryClient.invalidateQueries({ queryKey: queryKeys.pagos.all, refetchType: "active" })
		},
	})
}
