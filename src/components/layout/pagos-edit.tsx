import { cn } from "@/lib/utils"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { pagoFormValidator } from "db/pagos/pago-validator"
import { pagoQueryOptions } from "queries/pagos/pagos-query"
import { useUpdatePago } from "queries/pagos/use-update-pago"
import { toast } from "sonner"
import { X, Loader, CalendarIcon } from "lucide-react"
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
import { useState } from "react"
import { BG_RUBROS } from "@/_constants"
import { Button } from "../ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { localeDateToPeriodo, periodoToDate } from "@/lib/utils"
import type { PagoType } from "db/schema"
import type { RubroType } from "db/schema"

// Shell: gestiona la carga de datos y muestra skeleton mientras espera
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
	const [actualRubro, setActualRubro] = useState<string>(
		item?.rubro ?? "ragazzi"
	)

	return (
		<div
			className={cn(
				`w-full sm:w-1/4 mx-auto flex flex-col gap-6 border rounded-lg py-8 px-12 relative ${BG_RUBROS[actualRubro as keyof typeof BG_RUBROS]}`,
				className
			)}
			{...props}
		>
			<div className="absolute top-4 right-4">
				<Button
					variant="ghost"
					className="cursor-pointer"
					onClick={() => router.navigate({ to: returnedPath })}
					aria-label="Cerrar"
				>
					<X size={20} />
				</Button>
			</div>

			{isLoading && (
				<div className="flex flex-col gap-5">
					<h2 className="text-2xl font-bold">Editar Pago</h2>
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="w-full h-9 rounded-lg bg-gray-800/50 flex justify-center items-center border animate-pulse"
						>
							<Loader size={14} className="animate-spin" />
						</div>
					))}
				</div>
			)}

			{!isLoading && !item && (
				<p className="text-red-700 text-center">⚠ Pago no encontrado</p>
			)}

			{/* Montar el form solo cuando item y rubros estén disponibles.
			    key={item.id} garantiza que el form se remonta con defaultValues
			    correctos en lugar de depender de un useEffect posterior. */}
			{item && rubros && (
				<EditPagoFormInner
					key={item.id}
					item={item}
					rubros={rubros}
					returnedPath={returnedPath}
					actualRubro={actualRubro}
					setActualRubro={setActualRubro}
				/>
			)}
		</div>
	)
}

// Form interno: recibe item ya cargado, sus defaultValues son siempre correctos
function EditPagoFormInner({
	item,
	rubros,
	returnedPath,
	actualRubro,
	setActualRubro,
}: {
	item: PagoType
	rubros: RubroType[]
	returnedPath: string
	actualRubro: string
	setActualRubro: (rubro: string) => void
}) {
	const router = useRouter()
	const { mutateAsync: updateItemMutation, isPending, error } = useUpdatePago()

	const form = useForm({
		defaultValues: {
			periodo: item.periodo,
			rubro: item.rubro,
			sector: item.sector,
			monto: item.monto,
			pagado: item.pagado,
		},
		validators: {
			onSubmit: pagoFormValidator,
		},
		onSubmit: async ({ value }) => {
			const updatedItem = { ...value, id: item.id }
			const result = await updateItemMutation({ data: updatedItem })

			if (!result) {
				console.error("Error al editar el pago", error)
				toast.error("Error al editar el pago")
			}
			toast.success("Pago editado exitosamente")
			router.navigate({ to: returnedPath })
		},
	})

	const rubroValue = useStore(form.store, state => state.values.rubro)

	const getSectoresFromRubro = (rubroName: string) => {
		if (!rubroName) return []
		const selectedRubro = rubros.find(r => r.nombre === rubroName)
		if (!selectedRubro?.sectores) return []
		return selectedRubro.sectores.split(" ")
	}

	const sectoresDisponibles = getSectoresFromRubro(rubroValue)

	return (
		<form
			id="edit-form"
			onSubmit={e => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<FieldGroup className="gap-5">
				<h2 className="text-2xl font-bold">Editar Pago</h2>

				{/* Periodo */}
				<form.Field
					name="periodo"
					children={field => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid
						return (
							<Field data-invalid={isInvalid} className="gap-1">
								<FieldLabel htmlFor={field.name}>Periodo</FieldLabel>
								<CalendarDate
									initialDate={periodoToDate(field.state.value)}
									onDateSelect={value => form.setFieldValue("periodo", value)}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						)
					}}
				/>

				{/* Rubro */}
				<form.Field
					name="rubro"
					children={field => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid
						return (
							<Field data-invalid={isInvalid} className="gap-1">
								<FieldLabel htmlFor={field.name}>Rubro</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={value => {
										field.handleChange(value)
										setActualRubro(value)
										form.setFieldValue("sector", "")
									}}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Seleccionar rubro" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Rubro</SelectLabel>
											{rubros &&
												[
													...rubros,
													{ id: "varios", nombre: "varios", sectores: "" },
												]?.map(rubro => (
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						)
					}}
				/>

				{/* Sector */}
				<form.Field
					name="sector"
					children={field => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid
						return (
							<Field data-invalid={isInvalid} className="gap-1">
								<FieldLabel htmlFor={field.name}>Sector</FieldLabel>
								{rubroValue === "varios" ? (
									<Input
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Nuevo sector"
									/>
								) : (
									<Select
										key={`${actualRubro}-sector`}
										value={field.state.value}
										onValueChange={value => field.handleChange(value)}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Seleccionar sector" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Sector</SelectLabel>
												{sectoresDisponibles.map(sector => (
													<SelectItem key={sector} value={sector ?? ""}>
														{sector?.toUpperCase()}
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

				{/* Monto */}
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

				{/* Pagado */}
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
								Editando... <Loader className="animate-spin" />
							</div>
						) : (
							"Editar"
						)}
					</Button>
				</Field>

				{error && <p>{error?.message}</p>}
			</FieldGroup>
		</form>
	)
}

const CalendarDate = ({
	initialDate,
	onDateSelect,
}: {
	initialDate: Date
	onDateSelect: (value: number) => void
}) => {
	const [date, setDate] = useState<Date>(initialDate)
	const [openDate, setOpenDate] = useState(false)

	return (
		<Popover open={openDate} onOpenChange={setOpenDate}>
			<PopoverTrigger asChild className="w-full dark:bg-background">
				<Button
					variant="outline"
					className={!date ? "text-muted-foreground" : ""}
				>
					{date?.toLocaleDateString()}
					<CalendarIcon size={16} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={selectedDate => {
						setDate(selectedDate || new Date())
						setOpenDate(false)
						onDateSelect(localeDateToPeriodo(selectedDate || new Date()))
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}
