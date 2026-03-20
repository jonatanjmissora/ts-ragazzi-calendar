import { Button } from "@/components/ui/button"
import { localeDateToPeriodo } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { pagoFormValidator } from "db/pagos/pago-validator"
import { Check, Loader } from "lucide-react"
import { pagoQueryOptions } from "queries/pagos/pagos-query"
import { useUpdatePago } from "queries/pagos/use-update-pago"
import { toast } from "sonner"

export default function CheckPagoForm({ itemId }: { itemId: string }) {
	const { data: item } = useQuery(pagoQueryOptions(itemId))
	const { mutateAsync: updateItemMutation, isPending, error } = useUpdatePago()

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
			const updatedItem = {
				...value,
				pagado: localeDateToPeriodo(),
				id: itemId,
			}
			console.log("updatedItem", updatedItem)
			const result = await updateItemMutation({ data: updatedItem })

			if (!result) {
				console.error("Error al realizar el pago", error)
				toast.error("Error al realizar el pago")
			}
			toast.success("Pago realizado exitosamente")
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
			<Button variant="outline" type="submit" disabled={isPending}>
				{isPending ? (
					<Loader className="animate-spin"></Loader>
				) : (
					<Check size={16} />
				)}
			</Button>
		</form>
	)
}
