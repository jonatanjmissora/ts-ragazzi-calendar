import { cn } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { X } from "lucide-react"
import { FieldError, FieldGroup } from "../../ui/field"
import { Field } from "../../ui/field"
import { FieldLabel } from "../../ui/field"
import { Loader } from "lucide-react"
import { Input } from "../../ui/input"
import { rubroQueryOptions } from "queries/rubros/rubros-query"
import { useEffect } from "react"
import { useUpdateRubro } from "queries/rubros/use-update-rubro"
import { rubroFormValidator } from "db/rubros/rubro-validator"

export default function EditRubroForm({
	itemId,
	className,
	...props
}: React.ComponentProps<"div"> & { itemId: string }) {
	const router = useRouter()
	const { data: item, isLoading } = useQuery(rubroQueryOptions(itemId))
	const { mutateAsync: updateItemMutation, isPending, error } = useUpdateRubro()

	const form = useForm({
		defaultValues: {
			nombre: "",
			sectores: "",
		},
		validators: {
			onSubmit: rubroFormValidator,
		},
		onSubmit: async ({ value }) => {
			const updatedItem = {
				...value,
				id: itemId,
			}
			const result = await updateItemMutation({ data: updatedItem })

			if (!result) {
				console.error("Error al editar el rubro", error)
				toast.error("Error al editar el rubro")
			}
			toast.success("Rubro editado exitosamente")
			router.navigate({ to: "/admin" })
		},
	})

	// Update form values when item data loads
	useEffect(() => {
		if (item) {
			form.setFieldValue("nombre", item.nombre)
			form.setFieldValue("sectores", item.sectores)
		}
	}, [item, form])

	return (
		<div
			className={cn(
				"w-full sm:w-1/4 mx-auto flex flex-col gap-6 border rounded-lg py-8 px-12 relative bg-accent",
				className
			)}
			{...props}
		>
			<div className="absolute top-4 right-4">
				<Button
					variant="ghost"
					className="cursor-pointer"
					onClick={() => router.navigate({ to: "/admin" })}
				>
					<X size={20} />
				</Button>
			</div>
			<form
				id="edit-form"
				onSubmit={e => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<FieldGroup className="gap-5">
					<h2 className="text-2xl font-bold">Editar Rubro</h2>

					<form.Field
						name="nombre"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Rubro</FieldLabel>
									{isLoading ? (
										<div
											className={`w-full h-9 rounded-lg bg-gray-800/50 flex justify-center items-center border animate-pulse`}
										>
											Cargando... <Loader size={14} className="animate-spin" />
										</div>
									) : (
										!isLoading &&
										item && (
											<Input
												id={field.name}
												name={field.name}
												value={
													field.state.value === "" ? "" : field.state.value
												}
												onBlur={field.handleBlur}
												onChange={e => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="ingrese rubro"
											/>
										)
									)}
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					<form.Field
						name="sectores"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Sectores</FieldLabel>
									{isLoading ? (
										<div
											className={`w-full h-9 rounded-lg bg-gray-800/50 flex justify-center items-center border animate-pulse`}
										>
											Cargando... <Loader size={14} className="animate-spin" />
										</div>
									) : (
										!isLoading &&
										item && (
											<Input
												id={field.name}
												name={field.name}
												value={
													field.state.value === "" ? "" : field.state.value
												}
												onBlur={field.handleBlur}
												onChange={e => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="ingrese sectores"
											/>
										)
									)}
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					<Field>
						<Button type="submit" disabled={isPending || isLoading || !item}>
							{isPending ? (
								<div className="flex gap-2">
									Editando... <Loader className="animate-spin"></Loader>
								</div>
							) : (
								"Editar"
							)}
						</Button>
					</Field>

					{error && <p>{error?.message}</p>}
				</FieldGroup>
			</form>

			{!isLoading && !item && (
				<p className="text-red-700 text-center">⚠ rubro no encontrado</p>
			)}
		</div>
	)
}
