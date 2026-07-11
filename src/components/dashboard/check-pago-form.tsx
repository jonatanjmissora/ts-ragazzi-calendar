import { Button } from "@/components/ui/button"
import { getPeriodo, localeDateToPeriodo } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { pagoFormValidator } from "db/pagos/pago-validator"
import type { PagoType } from "db/pagos/schema"
import { Check, Loader } from "lucide-react"
import { pagosByPeriodoQueryOptions } from "queries/pagos/pagos-query"
import { queryKeys } from "queries/query-keys"
import { updatePagoServer } from "server/pagos/update-pago-server"
import { addMutationToQueue, putPagoInCache } from "@/lib/offline/db"
import { toast } from "sonner"
import { useState } from "react"

export default function CheckPagoForm({ itemId }: { itemId: string }) {
	const [start, end] = getPeriodo(undefined, undefined)
	const { data: pagosFromPeriodo } = useSuspenseQuery(
		pagosByPeriodoQueryOptions(start, end)
	)
	const queryClient = useQueryClient()
	const item = pagosFromPeriodo?.find(item => item.id === itemId)
	const [isPending, setIsPending] = useState(false)

	const form = useForm({
		defaultValues: {
			periodo: item?.periodo || 0,
			rubro: item?.rubro || "",
			sector: item?.sector || "",
			monto: item?.monto || 0,
			pagado: item?.pagado || 0,
		},
		validators: {
			onSubmit: pagoFormValidator,
		},
		onSubmit: async ({ value }) => {
			setIsPending(true)

			try {
				const updatedItem: PagoType = {
					...value,
					pagado: localeDateToPeriodo(),
					id: itemId,
				}

				try {
					await updatePagoServer({ data: updatedItem })
				} catch {
					await addMutationToQueue("update", updatedItem)
					await putPagoInCache(updatedItem)
				}

				const [pStart, pEnd] = getPeriodo(undefined, undefined)
				queryClient.setQueryData<PagoType>(queryKeys.pagos.byId(itemId), updatedItem)
				queryClient.setQueryData<PagoType[]>(
					queryKeys.pagos.byPeriodo(pStart, pEnd),
					oldPagos => {
						if (!oldPagos) return oldPagos
						return oldPagos.map(p => (p.id === itemId ? updatedItem : p))
					}
				)
				queryClient.invalidateQueries({
					queryKey: queryKeys.pagos.all,
					refetchType: "active",
				})

				toast.success("Pago realizado exitosamente")
			} catch {
				toast.error("Error al realizar el pago")
			} finally {
				setIsPending(false)
			}
		},
	})

	if (!item) {
		return <div>Error: No se encontró el pago con ID {itemId}</div>
	}

	return (
		<form
			id="create-form"
			className="flex flex-col items-center justify-center gap-2"
			onSubmit={e => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<Button variant="outline" type="submit" disabled={isPending} aria-label="Marcar como pagado">
				{isPending ? (
					<Loader className="animate-spin"></Loader>
				) : (
					<Check size={16} />
				)}
			</Button>
		</form>
	)
}
