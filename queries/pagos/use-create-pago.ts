import { getPeriodo } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { PagoFormType } from "db/pagos/pago-validator"
import type { PagoType } from "db/pagos/schema"
import { createPagoServer } from "server/pagos/create-pago-server"
import { addMutationToQueue, putPagoInCache } from "@/lib/offline/db"

export function useCreatePago() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ data }: { data: PagoFormType }) => {
			try {
				return await createPagoServer({ data })
			} catch {
				const newPago: PagoType = {
					...data,
					id: crypto.randomUUID(),
				}
				console.log(
					"[offline-debug] useCreatePago catch (offline) | id:",
					newPago.id,
					"periodo:",
					newPago.periodo,
				)
				await addMutationToQueue("create", newPago)
				await putPagoInCache(newPago)
				const { getPendingCount } = await import("@/lib/offline/db")
				const count = await getPendingCount()
				console.log(
					"[offline-debug] after putPagoInCache + queue | pending:",
					count,
				)
				return newPago
			}
		},
		onSuccess: async data => {
			const [start, end] = getPeriodo(undefined, undefined)
			queryClient.setQueryData<PagoType[]>(queryKeys.pagos.byPeriodo(start, end), oldPagos => {
				if (!oldPagos) return [data]
				return [data, ...oldPagos]
			})
			queryClient.invalidateQueries({ queryKey: queryKeys.pagos.all, refetchType: "active" })
		},
	})
}
