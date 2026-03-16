import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useDebouncedValue } from "@/lib/utils"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"

const MIN_PERIODO = 20200000

export default function PagosFilterPeriodoDesde() {
	const {
		"periodo-desde": periodoDesde,
		"periodo-desde-simbolo": periodoDesdeSimbolo,
		"periodo-hasta": periodoHasta,
	} = useSearch({ from: "/admin/" })
	const [periodoDesdeValue, setPeriodoDesdeValue] = useState(periodoDesde || "")
	const [periodoDesdeSimboloValue, setPeriodoDesdeSimboloValue] = useState(
		periodoDesdeSimbolo || "="
	)

	const navigate = useNavigate({ from: "/admin" })
	const debouncedValue = useDebouncedValue(periodoDesdeValue, 400)
	// sincroniza input ← URL al entrar/back/forward
	// useEffect(() => {
	// 	setPeriodoDesdeValue(periodoDesde ?? "")
	// }, [periodoDesde])
	//cuando cambia el debounced, actualiza la URL
	useEffect(() => {
		navigate({
			search: prev => {
				if (!debouncedValue || Number(periodoDesdeValue) < MIN_PERIODO) {
					setPeriodoDesdeSimboloValue("=")
					return undefined
				}
				const search = {
					...prev,
					"periodo-desde": debouncedValue || undefined,
					// "periodo-desde-simbolo": periodoDesdeSimboloValue || "=",
				}
				return search
			},
			replace: true, // no ensucia el history
		})
	}, [debouncedValue, navigate, periodoDesdeValue])

	// useEffect(() => {
	// 	setPeriodoDesdeSimboloValue(periodoDesdeSimbolo ?? "=")
	// }, [periodoDesdeSimbolo])

	return (
		<div className="flex items-center justify-center gap-3">
			<Label htmlFor="periodo-desde">Periodo desde</Label>

			{periodoDesdeValue && (
				<Select
					defaultValue="="
					value={periodoDesdeSimboloValue}
					onValueChange={(value: "<" | ">" | "=") => {
						setPeriodoDesdeSimboloValue(value)
						navigate({
							search: prev => ({
								...prev,
								"periodo-hasta": value !== ">" ? undefined : periodoHasta,
								"periodo-desde-simbolo": value || "=",
							}),
							replace: true, // no ensucia el history
						})
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
			)}

			<Input
				id="periodo-desde"
				className="w-30"
				name="periodo-desde"
				value={periodoDesdeValue}
				onChange={e => {
					setPeriodoDesdeValue(e.target.value)
					if (Number(e.target.value) >= MIN_PERIODO) {
						navigate({
							search: prev => ({
								...prev,
								"periodo-desde-simbolo": periodoDesdeSimboloValue || "=",
							}),
							replace: true, // no ensucia el history
						})
					}
				}}
				placeholder="yyyymmdd"
			/>
		</div>
	)
}
