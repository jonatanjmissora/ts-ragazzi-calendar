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

export default function PagosFilter() {
	const [rubroValue, setRubroValue] = useState("")
	const [sectorValue, setSectorValue] = useState("")

	const { data: rubros } = useQuery(rubrosQueryOptions)
	const rubrosNombreArray = rubros?.map(rubro => rubro.nombre) || []

	const getSectoresFromRubro = () => {
		if (!rubroValue || !rubros) return []

		const selectedRubro = rubros.find(r => r.nombre === rubroValue)
		if (!selectedRubro || !selectedRubro.sectores) return []

		return selectedRubro.sectores.split(" ")
	}

	const sectoresDisponibles = getSectoresFromRubro()

	return (
		<article className="flex items-center gap-20">
			<PagosFilterPeriodo />

			<div className="flex items-center justify-center gap-3">
				<Label htmlFor="rubro">Rubro</Label>

				<Select
					value={rubroValue}
					onValueChange={value => {
						setRubroValue(value)
						setSectorValue("")
					}}
				>
					<SelectTrigger className="w-30">
						<SelectValue placeholder={"..."} />
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
					value={sectorValue}
					onValueChange={value => {
						setSectorValue(value)
					}}
				>
					<SelectTrigger className="w-30">
						<SelectValue placeholder="..." />
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
