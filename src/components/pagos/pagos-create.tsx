import { Field, FieldGroup } from "../ui/field"
import { FieldLabel } from "../ui/field"
import { FieldError } from "../ui/field"
import { useRouter } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select"
import { Loader, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { pagoFormValidator } from "db/pagos/pago-validator"
import { useCreatePago } from "queries/pagos/use-create-pago"

export default function PagosCreate({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter()
	const { mutateAsync: createItemMutation, isPending, error } = useCreatePago()

	const form = useForm({
		defaultValues: {
			periodo: 0,
			rubro: "",
			sector: "",
			monto: 0,
			pagado: 0,
		},
		validators: {
			onSubmit: pagoFormValidator,
		},
		onSubmit: async ({ value }) => {
			const result = await createItemMutation({ data: value })

			if (!result) {
				console.error("Error al crear pago", error)
				toast.error("Error al crear el pago")
			}
			toast.success("Pago creado exitosamente")
			router.navigate({ to: "/admin" })
		},
	})

	return (
		<div
			className={cn(
				"min-w-1/3 flex flex-col gap-6 border rounded-lg py-8 px-12 relative",
				className
			)}
			{...props}
		>
			<div className="absolute top-4 right-4">
				<Button
					variant="ghost"
					className="cursor-pointer"
					onClick={() => router.navigate({ to: "/items" })}
				>
					<X size={20} />
				</Button>
			</div>
			<form
				id="create-form"
				onSubmit={e => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<FieldGroup className="gap-5">
					<h2 className="text-2xl font-bold">Crear pago</h2>

					<form.Field
						name="periodo"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(Number(e.target.value))}
										aria-invalid={isInvalid}
										placeholder="periodo"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					<form.Field
						name="rubro"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Telefono</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder=""
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					{/* <form.Field
						name="sector"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid

							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Servicio</FieldLabel>

									{isLoading && (
										<div className="flex items-center gap-2">
											Cargando... <Loader size={20} className="animate-spin" />
										</div>
									)}
									{!isLoading && (
										<Select
											value={
												field.state.value
													? String(field.state.value)
													: undefined
											}
											onValueChange={value => {
												field.handleChange(value)
											}}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Seleccionar categoría" />
											</SelectTrigger>

											<SelectContent>
												<SelectGroup>
													<SelectLabel>Servicios</SelectLabel>

													{categories?.map(category => (
														<SelectItem
															key={category.id}
															value={String(category.id)}
														>
															{category.name}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
									)}

									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/> */}

					<form.Field
						name="monto"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Fecha</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(Number(e.target.value))}
										aria-invalid={isInvalid}
										placeholder=""
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					<form.Field
						name="pagado"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(Number(e.target.value))}
										aria-invalid={isInvalid}
										placeholder="periodo"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					<Field>
						<Button type="submit" disabled={isPending}>
							{isPending ? (
								<div className="flex gap-2">
									Creando... <Loader className="animate-spin"></Loader>
								</div>
							) : (
								"Crear"
							)}
						</Button>
					</Field>

					{error && <p>{error.message}</p>}
				</FieldGroup>
			</form>
		</div>
	)
}
