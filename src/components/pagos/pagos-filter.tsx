import { Input } from "../ui/input"
import { useEffect, useState } from "react"
import { Label } from "../ui/label"
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectItem,
} from "../ui/select"
import { useQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { useNavigate } from "@tanstack/react-router"
import { useDebouncedValue } from "@/lib/utils"
import { useSearch } from "@tanstack/react-router"

export default function PagosFilter() {
	const {
		"periodo-desde": periodoDesde,
		"periodo-desde-simbolo": periodoDesdeSimbolo,
		"periodo-hasta": periodoHasta,
		"periodo-hasta-simbolo": periodoHastaSimbolo,
	} = useSearch({ from: "/admin/" })
	const [periodoDesdeValue, setPeriodoDesdeValue] = useState(periodoDesde || "")
	const [periodoDesdeSimboloValue, setPeriodoDesdeSimboloValue] = useState(
		periodoDesdeSimbolo || ""
	)
	const [periodoHastaValue, setPeriodoHastaValue] = useState(periodoHasta || "")
	const [periodoHastaSimboloValue, setPeriodoHastaSimboloValue] = useState(
		periodoHastaSimbolo || ""
	)
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

	const navigate = useNavigate({ from: "/admin" })
	const debouncedValue = useDebouncedValue(periodoDesdeValue, 400)
	// sincroniza input ← URL al entrar/back/forward
	useEffect(() => {
		setPeriodoDesdeValue(periodoDesde ?? "")
	}, [periodoDesde])
	// cuando cambia el debounced, actualiza la URL
	useEffect(() => {
		navigate({
			search: prev => ({
				...prev,
				"periodo-desde": debouncedValue || undefined,
			}),
			replace: true, // no ensucia el history
		})
	}, [debouncedValue, navigate])

	return (
		<article className="flex flex-col items-center gap-6">
			<div className="flex items-center gap-6">
				<div className="flex items-center justify-center gap-3">
					<Label htmlFor="periodo-desde">Periodo desde</Label>

					<Select
						defaultValue="="
						value={periodoDesdeSimboloValue}
						onValueChange={value => {
							setPeriodoDesdeSimboloValue(value)
						}}
					>
						<SelectTrigger className="w-16">
							<SelectValue placeholder={"="} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{["<", ">", "="].map(simbolo => (
									<SelectItem key={simbolo} value={simbolo}>
										{simbolo}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Input
						id="periodo-desde"
						className="w-30"
						name="periodo-desde"
						value={periodoDesdeValue}
						onChange={e => {
							setPeriodoDesdeValue(e.target.value)
						}}
						placeholder="yyyymmdd"
					/>
				</div>

				<div className="flex items-center justify-center gap-3">
					<Label htmlFor="periodo-hasta">Periodo hasta</Label>

					<Select
						defaultValue="="
						value={periodoHastaSimboloValue}
						onValueChange={value => {
							setPeriodoHastaSimboloValue(value)
						}}
					>
						<SelectTrigger className="w-16">
							<SelectValue placeholder={"="} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{["<", ">", "="].map(simbolo => (
									<SelectItem key={simbolo} value={simbolo}>
										{simbolo}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Input
						id="periodo-hasta"
						className="w-30"
						name="periodo-hasta"
						value={periodoHastaValue}
						onChange={e => {
							setPeriodoHastaValue(e.target.value)
						}}
						placeholder="yyyymmdd"
					/>
				</div>
			</div>

			<div className="flex items-center gap-6">
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
			</div>
		</article>
	)
}
