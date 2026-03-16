import { useState } from "react"
import { Label } from "../../ui/label"
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectItem,
} from "../../ui/select"
import { useQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import PagosFilterPeriodo from "./pagos-filter-periodo"
import { useNavigate, useSearch } from "@tanstack/react-router"

export default function PagosFilter() {
	const { rubro, sector } = useSearch({ from: "/admin/" })
	const [rubroValue, setRubroValue] = useState(rubro || "")
	const [sectorValue, setSectorValue] = useState(sector || "")
	const navigate = useNavigate({ from: "/admin" })

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
		<article className="flex items-center gap-20">
			<PagosFilterPeriodo />

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
					<SelectTrigger className="w-30">
						<SelectValue placeholder={rubroValue || "todos"} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{rubrosNombreArray.map(rubro => (
								<SelectItem key={rubro} value={rubro}>
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
					<SelectTrigger className="w-30">
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
		</article>
	)
}
