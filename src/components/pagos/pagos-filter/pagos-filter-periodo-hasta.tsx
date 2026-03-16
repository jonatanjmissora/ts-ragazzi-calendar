import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDebouncedValue } from "@/lib/utils"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"

export default function PagosFilterPeriodoHasta() {
	const {
		"periodo-desde": periodoDesde,
		"periodo-desde-simbolo": periodoDesdeSimbolo,
		"periodo-hasta": periodoHasta,
	} = useSearch({ from: "/admin/" })
	const [periodoHastaValue, setPeriodoHastaValue] = useState(periodoHasta || "")

	const navigate = useNavigate({ from: "/admin" })
	const debouncedValue = useDebouncedValue(periodoHastaValue, 400)
	// sincroniza input ← URL al entrar/back/forward
	useEffect(() => {
		setPeriodoHastaValue(periodoHasta ?? "")
	}, [periodoHasta])
	//cuando cambia el debounced, actualiza la URL

	useEffect(() => {
		navigate({
			search: prev => {
				if (!periodoDesde) {
					setPeriodoHastaValue("")
					return undefined
				}
				const search = {
					...prev,
					"periodo-hasta": debouncedValue || undefined,
					// "periodo-hasta-simbolo": periodoHastaSimboloValue || "=",
				}
				return search
			},
			replace: true, // no ensucia el history
		})
	}, [debouncedValue, navigate, periodoDesde])

	if (!periodoDesde || periodoDesdeSimbolo !== ">") {
		return null
	}

	return (
		<div className="flex items-center justify-center gap-3">
			<Label htmlFor="periodo-hasta">Periodo hasta</Label>

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
	)
}
