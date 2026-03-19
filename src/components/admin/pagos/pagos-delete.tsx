import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { pagoIdValidator } from "db/pagos/pago-validator"
import { PagoType } from "db/pagos/schema"
import { useDeletePago } from "queries/pagos/use-delete-pago"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { Loader } from "lucide-react"

export default function DeleteForm({
	item,
	setIsMenuOpen,
}: {
	item: PagoType
	setIsMenuOpen: (open: boolean) => void
}) {
	const {
		mutateAsync: deleteItemMutation,
		error,
		isPending,
	} = useDeletePago(item.id)
	const router = useRouter()

	const form = useForm({
		defaultValues: {
			id: item.id,
		},
		validators: {
			onSubmit: pagoIdValidator,
		},
		onSubmit: async ({ value }) => {
			const result = await deleteItemMutation({ data: { id: value.id } })

			if (!result) {
				console.error("Error al eliminar el pago", error)
				toast.error("Error al eliminar el pago")
			}
			toast.success("Pago eliminado exitosamente")
			router.invalidate()
		},
	})

	return (
		<form
			id="create-form"
			className="flex flex-col items-center justify-center gap-2"
			onSubmit={e => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<p className="text-xl font-semibold text-center">
				¿Estás seguro de borrar el pago?
			</p>

			<p className="text-center opacity-50 text-xs balance">
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
			{error && (
				<p className="text-red-500 text-xs">Error al eliminar el pago</p>
			)}
		</form>
	)
}
