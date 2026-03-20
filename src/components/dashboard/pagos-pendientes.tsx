import { useSuspenseQuery } from "@tanstack/react-query"
import { pagosByPeriodoQueryOptions } from "queries/pagos/pagos-query"
import { Suspense } from "react"
import { Check, Ellipsis } from "lucide-react"
import { Button } from "../ui/button"
import { filteredItems, periodoConvert } from "@/lib/utils"
import DashboardFilter from "./dashboard-filter"
import { useSearch } from "@tanstack/react-router"
import { Switch } from "../ui/switch"
import { BG_RUBROS } from "@/_constants"

export default function DashboardPagosPendientes() {
	const { rubro, sector } = useSearch({ from: "/_protected/" }) as {
		rubro?: string
		sector?: string
	}

	return (
		<article className="sm:w-3/4 2xl:w-2/3 mx-auto flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
			<Suspense fallback={<div>...</div>}>
				<DashboardFilter rubro={rubro} sector={sector} />
			</Suspense>
			<GridContainer6 className=" text-lg font-semibold">
				<span></span>
				<span>vencimiento</span>
				<span>rubro</span>
				<span>sector</span>
				<span>monto</span>
				<span>menu</span>
			</GridContainer6>
			<Suspense fallback={<PagosSkelton />}>
				<PagosPendientesList rubro={rubro} sector={sector} />
			</Suspense>
		</article>
	)
}

function PagosPendientesList({
	rubro,
	sector,
}: {
	rubro?: string
	sector?: string
}) {
	const { data: pagosFromPeriodo } = useSuspenseQuery(
		pagosByPeriodoQueryOptions
	)

	const pagosPendientes = filteredItems(
		pagosFromPeriodo || [],
		undefined,
		undefined,
		rubro,
		sector
	).filter(item => item.pagado === 0)

	return (
		<div className="flex flex-col gap-2">
			{pagosPendientes?.reverse().map(item => (
				<GridContainer6
					key={item.id}
					rubro={item.rubro}
					className="my-1 py-1 rounded-lg shadow"
				>
					<Switch id="check" size="sm" className="mx-2" />
					<span>{periodoConvert(item.periodo)}</span>
					<span>{item.rubro.toUpperCase()}</span>
					<span>{item.sector.toUpperCase()}</span>
					<span>{item.monto}</span>
					<div className="flex justify-between gap-2">
						<Button variant="outline">
							<Check size={16} />
						</Button>
						<Button variant="outline">
							<Ellipsis size={16} />
						</Button>
					</div>
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

const PagosSkelton = () => {
	const backgrounds = {
		0: "bg-(--ragazzi)/65",
		1: "bg-(--palihue)/50",
		2: "bg-(--patricios)/35",
		3: "bg-(--jmolina)/20",
		4: "bg-(--palihue)/5",
	} as const

	return (
		<div className="flex flex-col gap-2">
			{Array.from({ length: 5 }).map((_, index) => (
				<div
					key={Math.random()}
					className={`my-1 py-1 rounded-xl shadow h-11 ${backgrounds[index as keyof typeof backgrounds]}`}
				></div>
			))}
		</div>
	)
}
