import { Input } from "@/components/ui/input"
// import { useDebouncedValue } from "@/lib/utils"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useState } from "react"

const MIN_PERIODO = 20200000

export default function PagosFilterPeriodo() {
	const { "periodo-desde": periodoDesde, "periodo-hasta": periodoHasta } =
		useSearch({ from: "/admin/pagos/" })
	const [periodoDesdeValue, setPeriodoDesdeValue] = useState(periodoDesde || "")
	const [periodoHastaValue, setPeriodoHastaValue] = useState(periodoHasta || "")

	const navigate = useNavigate({ from: "/admin/pagos/" })

	const periodoValido = (value: string) =>
		Number(value) >= MIN_PERIODO && Number(value) <= 29999999

	return (
		<article>
			<Input
				id="periodo-desde"
				className={`w-24  text-center dark:bg-background ${periodoDesdeValue !== "" && !periodoValido(periodoDesdeValue) && "dark:bg-red-500/30 bg-red-500/30"}`}
				name="periodo-desde"
				defaultValue={periodoDesdeValue}
				onChange={e => {
					setPeriodoDesdeValue(e.target.value)
					navigate({
						search: prev => {
							const search = {
								...prev,
								"periodo-desde": periodoValido(e.target.value)
									? e.target.value
									: undefined,
							}
							return search
						},
						replace: true, // no ensucia el history
					})
				}}
				placeholder="yyyymmdd"
			/>
			<span className="mx-2">
				{"<"} periodo {"<"}{" "}
			</span>

			<Input
				id="periodo-hasta"
				className={`w-24  text-center dark:bg-background ${periodoHastaValue !== "" && !periodoValido(periodoHastaValue) && "dark:bg-red-500/30 bg-red-500/30"}`}
				name="periodo-hasta"
				defaultValue={periodoHastaValue}
				onChange={e => {
					setPeriodoHastaValue(e.target.value)
					navigate({
						search: prev => {
							const search = {
								...prev,
								"periodo-hasta": periodoValido(e.target.value)
									? e.target.value
									: undefined,
							}
							return search
						},
						replace: true, // no ensucia el history
					})
				}}
				placeholder="yyyymmdd"
			/>
		</article>
	)
}
