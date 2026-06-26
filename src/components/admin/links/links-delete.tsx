import { useForm } from "@tanstack/react-form"
import { useRouter } from "@tanstack/react-router"
import { LinkType } from "db/schema"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { Loader } from "lucide-react"
import { useDeleteLink } from "queries/links/use-delete-link"
import { linkIdValidator } from "db/links/link-validator"

export default function DeleteLinkForm({
	item,
	setIsMenuOpen,
}: {
	item: LinkType
	setIsMenuOpen: (open: boolean) => void
}) {
	const {
		mutateAsync: deleteItemMutation,
		error,
		isPending,
	} = useDeleteLink(item.id)
	const router = useRouter()

	const form = useForm({
		defaultValues: {
			id: item.id,
		},
		validators: {
			onSubmit: linkIdValidator,
		},
		onSubmit: async ({ value }) => {
			const result = await deleteItemMutation({ data: { id: value.id } })

			if (!result) {
				toast.error("Error al eliminar el link")
			}
			toast.success("Link eliminado exitosamente")
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
				¿Estás seguro de borrar el link?
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
			{error && (
				<p className="text-red-500 text-xs">Error al eliminar el link</p>
			)}
		</form>
	)
}
