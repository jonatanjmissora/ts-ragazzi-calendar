import { BG_RUBROS } from "@/_constants"
import {
	filteredItems,
	getPeriodo,
	montoFormat,
	periodoConvert,
} from "@/lib/utils"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { pagosByPeriodoQueryOptions } from "queries/pagos/pagos-query"

export default function PagosRealizadosList({
	rubro,
	sector,
}: {
	rubro?: string
	sector?: string
}) {
	const { mes: mesUrl, anio: anioUrl } = useSearch({ from: "/_protected/" })
	const [start, end] = getPeriodo(mesUrl, anioUrl)

	const { data: pagosFromPeriodo } = useSuspenseQuery(
		pagosByPeriodoQueryOptions(start, end)
	)

	const pagosRealizados = filteredItems(
		pagosFromPeriodo || [],
		undefined,
		undefined,
		rubro,
		sector
	)
		.filter(item => item.pagado !== 0)
		.sort((a, b) => a.periodo - b.periodo)

	return (
		<div className="flex flex-col gap-2">
			{pagosRealizados?.map(item => (
				<GridContainer6
					key={item.id}
					rubro={item.rubro}
					className="my-1 py-1 rounded-lg shadow h-12"
				>
					<span></span>
					<span>{periodoConvert(item.periodo)}</span>
					<span>{item.rubro.toUpperCase()}</span>
					<span>{item.sector.toUpperCase()}</span>
					<span>{montoFormat(item.monto)}</span>
					<span></span>
				</GridContainer6>
			))}
		</div>
	)
}

const GridContainer6 = ({
	className,
	children,
	rubro,
}: {
	className?: string
	children: React.ReactNode
	rubro?: string
}) => {
	return (
		<div
			className={`grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr] items-center gap-6 ${className} ${BG_RUBROS[rubro as keyof typeof BG_RUBROS]}`}
		>
			{children}
		</div>
	)
}
