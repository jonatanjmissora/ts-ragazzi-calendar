import { Suspense, useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../ui/accordion"

import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { CalendarIcon, Loader, Play } from "lucide-react"
import { Input } from "../ui/input"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { pagoFormValidator } from "db/pagos/pago-validator"
import { Field, FieldError, FieldGroup } from "../ui/field"
import { useCreatePago } from "queries/pagos/use-create-pago"
import { getUnusedSectoresFromPeriodo, localeDateToPeriodo } from "@/lib/utils"
import { pagosByPeriodoQueryOptions } from "queries/pagos/pagos-query"

const RUBROS = ["ragazzi", "patricio", "palihue", "jmolina"]

export default function DashboardCreatePago() {
	const [accordionValue, setAccordionValue] = useState("")

	return (
		<article className="">
			<Accordion
				type="single"
				collapsible
				value={accordionValue}
				onValueChange={setAccordionValue}
			>
				{RUBROS.map(rubro => (
					<AccordionItem
						key={rubro}
						value={rubro}
						className="hover:bg-background/60 bg-background my-3 p-2 rounded-lg shadow "
					>
						<AccordionTrigger className="flex items-center justify-between px-4 m-0">
							<span className="m-0 tracking-widest">{rubro.toUpperCase()}</span>
							<Suspense>
								<UnusedSectoresFromRubroComponent rubro={rubro} />
							</Suspense>
						</AccordionTrigger>
						<Suspense>
							<AccordionContent>
								<PagosCreate
									rubro={rubro}
									setAccordionValue={setAccordionValue}
								/>
							</AccordionContent>
						</Suspense>
					</AccordionItem>
				))}
			</Accordion>
		</article>
	)
}

const UnusedSectoresFromRubroComponent = ({ rubro }: { rubro: string }) => {
	const { data: rubros } = useSuspenseQuery(rubrosQueryOptions)
	const { data: pagosFromPeriodo } = useSuspenseQuery(
		pagosByPeriodoQueryOptions
	)

	// obtengo los sectores que no estan utilizados del periodo
	const unusedSectoresObj = getUnusedSectoresFromPeriodo(
		pagosFromPeriodo || [],
		rubros || []
	)
	return (
		<span className="text-foreground/30">
			( {getUnusedSectoresFromRubroArray(rubro, unusedSectoresObj).length} )
		</span>
	)
}

const PagosCreate = ({
	rubro,
	setAccordionValue,
}: {
	rubro: string
	setAccordionValue: (value: string) => void
}) => {
	const { data: rubros } = useSuspenseQuery(rubrosQueryOptions)
	const { data: pagosFromPeriodo } = useSuspenseQuery(
		pagosByPeriodoQueryOptions
	)

	// obtengo los sectores que no estan utilizados del periodo
	const unusedSectoresObj = getUnusedSectoresFromPeriodo(
		pagosFromPeriodo || [],
		rubros || []
	)

	const unusedSectoresFromRubroArray = getUnusedSectoresFromRubroArray(
		rubro,
		unusedSectoresObj
	)

	const { mutateAsync: createItemMutation, isPending, error } = useCreatePago()

	const form = useForm({
		defaultValues: {
			periodo: localeDateToPeriodo(new Date()),
			rubro,
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
				form.reset()
				setAccordionValue("")
			}
		},
	})

	if (unusedSectoresFromRubroArray.length === 0) {
		return
	}

	return (
		<div className="w-full  flex flex-col gap-6 relative bg-accent">
			<form
				id="create-form"
				onSubmit={e => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<FieldGroup className="gap-3 my-3">
					<form.Field
						name="sector"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid

							return (
								<Field data-invalid={isInvalid} className="gap-1">
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
												{unusedSectoresFromRubroArray?.map(sector => (
													<SelectItem key={sector} value={sector}>
														{sector.toUpperCase()}
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

					<form.Field
						name="periodo"
						children={field => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid
							return (
								<Field data-invalid={isInvalid} className="gap-1">
									<CalendarDate form={form} />
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							)
						}}
					/>

					<div className="flex items-start gap-2">
						<form.Field
							name="monto"
							children={field => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid
								return (
									<Field data-invalid={isInvalid} className="gap-1">
										<Input
											className="text-center"
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(Number(e.target.value))}
											aria-invalid={isInvalid}
											placeholder="0"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								)
							}}
						/>

						<Field className="w-1/3">
							<Button type="submit" disabled={isPending}>
								{isPending ? (
									<Loader size={16} className="animate-spin"></Loader>
								) : (
									<Play size={16} />
								)}
							</Button>
						</Field>
					</div>
					{error && <p>{error.message}</p>}
				</FieldGroup>
			</form>
		</div>
	)
}

const CalendarDate = ({ form }: { form: unknown }) => {
	const [date, setDate] = useState<Date>(new Date())
	const [openDate, setOpenDate] = useState(false)

	return (
		<Popover open={openDate} onOpenChange={setOpenDate}>
			<PopoverTrigger asChild className="w-full dark:bg-background">
				<Button
					variant={"outline"}
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
						// Close the popover after a date is selected
						setOpenDate(false)
						// Update the form field with the selected date
						form.setFieldValue(
							"periodo",
							localeDateToPeriodo(selectedDate || new Date())
						)
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}

type UnusedSectoresType = {
	nombre: string
	sectores: string[]
}
// obtengo los sectores que no estan utilizados para un rubro
function getUnusedSectoresFromRubroArray(
	rubro: string,
	unusedSectoresObj: UnusedSectoresType[]
) {
	return unusedSectoresObj.find(r => r.nombre === rubro)?.sectores || []
}
