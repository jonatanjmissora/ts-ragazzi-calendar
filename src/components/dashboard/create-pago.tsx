import { Suspense, useState } from "react"
import { Card, CardContent, CardTitle } from "../ui/card"
import { useSuspenseQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select"

import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { CalendarIcon, Play } from "lucide-react"
import { Input } from "../ui/input"

export default function DashboardCreatePago() {
	const RUBROS = ["ragazzi", "patricio", "palihue", "jmolina"]

	return (
		<article className="flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
			{RUBROS.map(rubro => (
				<Card
					key={rubro}
					className="flex flex-row items-center justify-between gap-0 w-full p-4 py-2 relative text-xs 2xl:text-base bg-background"
				>
					<CardTitle>{rubro.toUpperCase()}</CardTitle>
					<Suspense fallback={<div>Cargando...</div>}>
						<CardContentElement rubro={rubro} />
					</Suspense>
				</Card>
			))}
		</article>
	)
}

const CardContentElement = ({ rubro }: { rubro: string }) => {
	const { data: items } = useSuspenseQuery(rubrosQueryOptions)
	const item = items?.find(item => item.nombre === rubro)

	const [date, setDate] = useState<Date | undefined>(new Date())
	const [open, setOpen] = useState(false)

	if (!item) {
		return null
	}

	return (
		<CardContent className="flex gap-6 items-center justify-between p-2">
			<span>({item.sectores.split(" ").length})</span>

			<Select>
				<SelectTrigger>
					<SelectValue placeholder="sector..." />
				</SelectTrigger>
				<SelectContent>
					{item.sectores.split(" ").map(sector => (
						<SelectItem key={sector} value={sector}>
							{sector}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className={!date ? "text-muted-foreground" : ""}
					>
						<CalendarIcon size={16} />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={selectedDate => {
							setDate(selectedDate)
							// Close the popover after a date is selected
							setOpen(false)
						}}
						initialFocus
					/>
				</PopoverContent>
			</Popover>

			<Input
				type="number"
				className="w-25 text-right"
				placeholder="monto..."
				defaultValue={"0"}
			/>

			<Button variant="outline">
				<Play className="h-4 w-4" />
			</Button>
		</CardContent>
	)
}
