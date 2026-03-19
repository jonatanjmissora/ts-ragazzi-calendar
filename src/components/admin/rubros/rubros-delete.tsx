import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { RubroType } from "db/pagos/schema"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { Loader } from "lucide-react"
import { useDeleteRubro } from "queries/rubros/use-delete-rubro"
import { rubroIdValidator } from "db/rubros/rubro-validator"

export default function DeleteForm({
	item,
	setIsMenuOpen,
}: {
	item: RubroType
	setIsMenuOpen: (open: boolean) => void
}) {
	const {
		mutateAsync: deleteItemMutation,
		error,
		isPending,
	} = useDeleteRubro(item.id)
	const router = useRouter()

	const form = useForm({
		defaultValues: {
			id: item.id,
		},
		validators: {
			onSubmit: rubroIdValidator,
		},
		onSubmit: async ({ value }) => {
			const result = await deleteItemMutation({ data: { id: value.id } })

			if (!result) {
				console.error("Error al eliminar el rubro", error)
				toast.error("Error al eliminar el rubro")
			}
			toast.success("Rubro eliminado exitosamente")
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
				¿Estás seguro de borrar el rubro?
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
				<p className="text-red-500 text-xs">Error al eliminar el rubro</p>
			)}
		</form>
	)
}
