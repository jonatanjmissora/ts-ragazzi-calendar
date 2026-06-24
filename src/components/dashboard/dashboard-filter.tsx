import { Label } from "../ui/label"
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectItem,
} from "../ui/select"
import { Suspense, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { BG_RUBROS } from "@/_constants"
import { Filter, FunnelX } from "lucide-react"
import { Button } from "../ui/button"
import Periodo from "./periodo"

interface DashboardFilterProps {
	rubro?: string
	sector?: string
}

export default function DashboardFilter({
	rubro,
	sector,
}: DashboardFilterProps) {
	const [showFilter, setShowFilter] = useState(false)

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-14">
			<div className=""></div>
			<Periodo />
			<div className="flex items-center gap-4 ">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setShowFilter(s => !s)}
					aria-label="Toggle filter"
				>
					{rubro || sector ? (
						<FunnelX className="size-5 text-amber-700" />
					) : (
						<Filter className="size-5" />
					)}
				</Button>
				{showFilter && (
					<Suspense fallback={<span>...</span>}>
						<FilterContent rubro={rubro} sector={sector} />
					</Suspense>
				)}
			</div>
		</div>
	)
}

function FilterContent({ rubro, sector }: DashboardFilterProps) {
	const [rubroValue, setRubroValue] = useState(rubro || "")
	const [sectorValue, setSectorValue] = useState(sector || "")
	const navigate = useNavigate({ from: "/" })

	const { data: rubros } = useQuery(rubrosQueryOptions)
	const rubrosNombreArray = [
		"todos",
		...(rubros?.map(element => element.nombre) || []),
	]
	const getSectoresFromRubro = () => {
		if (!rubroValue || !rubros) return []

		const selectedRubro = rubros.find(r => r.nombre === rubroValue)
		if (!selectedRubro || !selectedRubro.sectores) return []

		return selectedRubro.sectores.split(" ")
	}

	const sectoresDisponibles = ["todos", ...getSectoresFromRubro()]
	return (
		<div className="flex items-center gap-10 flex-wrap">
			<div className="flex items-center justify-center gap-3">
				<Label htmlFor="rubro">Rubro</Label>

				<Select
					defaultValue="todos"
					value={rubroValue}
					onValueChange={value => {
						setRubroValue(value)
						setSectorValue("todos")
						navigate({
							search: prev => {
								const search = {
									...prev,
									rubro: value === "todos" ? undefined : value,
									sector: undefined,
								}
								return search
							},
							replace: true, // no ensucia el history
						})
					}}
				>
					<SelectTrigger
						className={`w-30 ${BG_RUBROS[rubroValue as keyof typeof BG_RUBROS] || "bg-background"}`}
					>
						<SelectValue placeholder={rubroValue || "todos"} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{rubrosNombreArray.map(rubro => (
								<SelectItem
									key={rubro}
									value={rubro}
									className={BG_RUBROS[rubro as keyof typeof BG_RUBROS]}
								>
									{rubro}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center justify-center gap-3">
				<Label htmlFor="sector">Sector</Label>

				<Select
					defaultValue="todos"
					value={sectorValue}
					onValueChange={value => {
						setSectorValue(value)
						navigate({
							search: prev => {
								const search = {
									...prev,
									sector: value === "todos" ? undefined : value,
								}
								return search
							},
							replace: true, // no ensucia el history
						})
					}}
				>
					<SelectTrigger className="w-30 bg-background">
						<SelectValue placeholder={sectorValue || "todos"} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{sectoresDisponibles.map(sector => (
								<SelectItem key={sector} value={sector}>
									{sector}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}
