import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { pagoIdValidator } from "db/pagos/pago-validator"
import type { PagoType } from "db/schema"
import { queryKeys } from "queries/query-keys"
import { deletePagoServer } from "server/pagos/delete-pago-server"
import { addMutationToQueue, removePagoFromCache } from "@/lib/offline/db"
import { getPeriodo } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Loader } from "lucide-react"
import { useState } from "react"

export default function DeletePagoForm({
	item,
	setIsMenuOpen,
}: {
	item: PagoType
	setIsMenuOpen: (open: boolean) => void
}) {
	const queryClient = useQueryClient()
	const [isPending, setIsPending] = useState(false)

	const form = useForm({
		defaultValues: {
			id: item.id,
		},
		validators: {
			onSubmit: pagoIdValidator,
		},
		onSubmit: async ({ value }) => {
			setIsPending(true)

			try {
				try {
					await deletePagoServer({ data: { id: value.id } })
				} catch {
					await addMutationToQueue("delete", { id: value.id })
					await removePagoFromCache(value.id)
				}

				const [start, end] = getPeriodo(undefined, undefined)
				queryClient.setQueryData<PagoType[]>(
					queryKeys.pagos.byPeriodo(start, end),
					oldItems => {
						if (!oldItems) return oldItems
						return oldItems.filter(item => item.id !== value.id)
					}
				)
				queryClient.invalidateQueries({
					queryKey: queryKeys.pagos.all,
					refetchType: "active",
				})

				toast.success("Pago eliminado exitosamente")
				setIsMenuOpen(false)
			} catch {
				toast.error("Error al eliminar el pago")
			} finally {
				setIsPending(false)
			}
		},
	})

	return (
		<form
			id="delete-form"
			className="flex flex-col items-center justify-center gap-2"
			onSubmit={e => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<p className="text-xl font-semibold text-center">
				¿Estás seguro de borrar {item.rubro}-{item.sector}?
			</p>

			<p className="text-center opacity-50 text-xs">
				Esta acción no se puede deshacer. Esto eliminará permanentemente el dato
				de nuestros servidores.
			</p>

			<div className="flex justify-center items-center gap-2">
				<Button
					type="button"
					variant="ghost"
					onClick={() => setIsMenuOpen(false)}
				>
					Cancelar
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? (
						<div className="flex gap-2">
							Eliminando... <Loader className="animate-spin"></Loader>
						</div>
					) : (
						"Eliminar"
					)}
				</Button>
			</div>
		</form>
	)
}
