import { Field, FieldGroup } from "../../ui/field"
import { FieldLabel } from "../../ui/field"
import { FieldError } from "../../ui/field"
import { useRouter } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { useForm, useStore } from "@tanstack/react-form"
import { toast } from "sonner"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../../ui/select"
import { Loader, X } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { pagoFormValidator } from "db/pagos/pago-validator"
import { useCreatePago } from "queries/pagos/use-create-pago"
import { useQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"

export default function PagosCreate({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter()
	const { data: rubros, isLoading } = useQuery(rubrosQueryOptions)
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
			} else {
				toast.success("Pago creado exitosamente")
				router.navigate({ to: "/admin" })
			}
		},
	})

	const rubroValue = useStore(form.store, state => state.values.rubro)

	const getSectoresFromRubro = (rubroName: string) => {
		if (!rubroName || !rubros) return []

		const selectedRubro = rubros.find(r => r.nombre === rubroName)
		if (!selectedRubro || !selectedRubro.sectores) return []

		return selectedRubro.sectores.split(" ")
	}

	const sectoresDisponibles = getSectoresFromRubro(rubroValue)

	return (
		<div
			className={cn(
				"w-full sm:w-1/4 mx-auto flex flex-col gap-6 border rounded-lg py-8 px-12 relative",
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
									<FieldLabel htmlFor={field.name}>Periodo</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value === 0 ? "" : field.state.value}
										onBlur={field.handleBlur}
										onChange={e => {
											const numValue = Number(e.target.value)
											field.handleChange(Number.isNaN(numValue) ? 0 : numValue)
										}}
										aria-invalid={isInvalid}
										placeholder="yyyymmdd"
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
							if (!field.state.value && rubros?.length) {
								field.handleChange(rubros[0].nombre)
							}

							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Rubro</FieldLabel>

									{isLoading && (
										<div className="flex items-center gap-3 text-sm font-thin p-2 px-3 border rounded-lg bg-accent shadow-lg">
											Cargando... <Loader size={14} className="animate-spin" />
										</div>
									)}
									{!isLoading && (
										<Select
											value={field.state.value}
											onValueChange={value => {
												field.handleChange(value)
												form.setFieldValue("sector", "")
											}}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder={"Seleccionar rubro"} />
											</SelectTrigger>

											<SelectContent>
												<SelectGroup>
													<SelectLabel>Rubro</SelectLabel>

													{rubros?.map(rubro => (
														<SelectItem
															key={rubro.id}
															value={String(rubro.nombre)}
														>
															{rubro.nombre.toUpperCase()}
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
					/>

					<form.Field
						name="sector"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							if (!field.state.value && rubros?.[0]?.sectores) {
								field.handleChange(sectoresDisponibles[0])
							}

							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Sector</FieldLabel>

									{isLoading && (
										<div className="flex items-center gap-3 text-sm font-thin p-2 px-3 border rounded-lg bg-accent shadow-lg">
											Cargando... <Loader size={14} className="animate-spin" />
										</div>
									)}
									{!isLoading && (
										<Select
											value={field.state.value ?? ""}
											onValueChange={value => {
												field.handleChange(value)
											}}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder={"Seleccionar sector"} />
											</SelectTrigger>

											<SelectContent>
												<SelectGroup>
													<SelectLabel>Sector</SelectLabel>

													{sectoresDisponibles.map(sector => (
														<SelectItem key={sector} value={sector}>
															{sector.toUpperCase()}
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
					/>

					<form.Field
						name="monto"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Monto</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(Number(e.target.value))}
										aria-invalid={isInvalid}
										placeholder="0"
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
									<FieldLabel htmlFor={field.name}>Pagado</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value === 0 ? "" : field.state.value}
										onBlur={field.handleBlur}
										onChange={e => {
											const numValue = Number(e.target.value)
											field.handleChange(Number.isNaN(numValue) ? 0 : numValue)
										}}
										aria-invalid={isInvalid}
										placeholder="yyyymmdd"
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
