import { cn } from "@/lib/utils"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { pagoFormValidator } from "db/pagos/pago-validator"
import { pagoQueryOptions } from "queries/pagos/pagos-query"
import { useUpdatePago } from "queries/pagos/use-update-pago"
import { toast } from "sonner"
import { X } from "lucide-react"
import { Loader } from "lucide-react"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select"
import { useEffect, useState } from "react"
import { BG_RUBROS } from "@/_constants"
import { Button } from "../ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"

export default function EditPagoForm({
	itemId,
	className,
	...props
}: React.ComponentProps<"div"> & { itemId: string }) {
	const router = useRouter()
	const originPath = router.state.location.pathname.split("/")[1]
	const returnedPath = originPath === "pagos" ? "/" : "/admin/pagos"
	const { data: rubros } = useQuery(rubrosQueryOptions)
	const { data: item, isLoading } = useQuery(pagoQueryOptions(itemId))
	const { mutateAsync: updateItemMutation, isPending, error } = useUpdatePago()
	const [actualRubro, setActualRubro] = useState<string>("")

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
				id: itemId,
			}
			const result = await updateItemMutation({ data: updatedItem })

			if (!result) {
				console.error("Error al editar el pago", error)
				toast.error("Error al editar el pago")
			}
			toast.success("Pago editado exitosamente")
			router.navigate({ to: returnedPath })
		},
	})

	// Update form values when item data loads
	useEffect(() => {
		if (item) {
			setTimeout(() => {
				form.reset({
					periodo: item.periodo,
					rubro: item.rubro,
					sector: item.sector,
					monto: item.monto,
					pagado: item.pagado,
				})
				setActualRubro(item.rubro)
			}, 0)
		}
	}, [item, form])

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
				`w-full sm:w-1/4 mx-auto flex flex-col gap-6 border rounded-lg py-8 px-12 relative ${BG_RUBROS[(rubroValue || actualRubro) as keyof typeof BG_RUBROS]}`,
				className
			)}
			{...props}
		>
			<div className="absolute top-4 right-4">
				<Button
					variant="ghost"
					className="cursor-pointer"
					onClick={() => router.navigate({ to: returnedPath })}
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
					<h2 className="text-2xl font-bold">Editar Pago</h2>

					<form.Field
						name="periodo"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Periodo</FieldLabel>
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
												value={field.state.value === 0 ? "" : field.state.value}
												onBlur={field.handleBlur}
												onChange={e =>
													field.handleChange(Number(e.target.value))
												}
												aria-invalid={isInvalid}
												placeholder="yyyymmdd"
											/>
										)
									)}
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
									<FieldLabel htmlFor={field.name}>Rubro</FieldLabel>

									{isLoading ? (
										<div
											className={`w-full h-9 rounded-lg bg-gray-800/50 flex justify-center items-center border animate-pulse`}
										>
											Cargando... <Loader size={14} className="animate-spin" />
										</div>
									) : (
										item && (
											<Select
												key={item.id}
												value={field.state.value}
												onValueChange={value => {
													field.handleChange(value)
													setActualRubro(value)
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
										)
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
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<FieldLabel htmlFor={field.name}>Sector</FieldLabel>

									{isLoading ? (
										<div
											className={`w-full h-9 rounded-lg bg-gray-800/50 flex justify-center items-center border animate-pulse`}
										>
											Cargando... <Loader size={14} className="animate-spin" />
										</div>
									) : (
										!isLoading &&
										item && (
											<Select
												key={`${item.id}-${rubroValue}`}
												value={field.state.value}
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
										)
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
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={e =>
													field.handleChange(Number(e.target.value))
												}
												aria-invalid={isInvalid}
												placeholder="0"
											/>
										)
									)}
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
												value={field.state.value === 0 ? "" : field.state.value}
												onBlur={field.handleBlur}
												onChange={e => {
													const numValue = Number(e.target.value)
													field.handleChange(
														Number.isNaN(numValue) ? 0 : numValue
													)
												}}
												aria-invalid={isInvalid}
												placeholder="yyyymmdd"
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
				<p className="text-red-700 text-center">⚠ Pago no encontrado</p>
			)}
		</div>
	)
}
