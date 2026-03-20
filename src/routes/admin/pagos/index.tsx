import PagosFilter from "@/components/admin/pagos/pagos-filter/pagos-filter"
import PagosList from "@/components/admin/pagos/pagos-list"
import { filteredItems, sortByPeriodo } from "@/lib/utils"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useSearch } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { pagosQueryOptions } from "queries/pagos/pagos-query"
import { Suspense } from "react"
import z from "zod"

export const Route = createFileRoute("/admin/pagos/")({
	validateSearch: z.object({
		"periodo-desde": z.string().optional(),
		"periodo-hasta": z.string().optional(),
		rubro: z.string().optional(),
		sector: z.string().optional(),
	}),
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<article className="sm:w-3/4 2xl:w-2/3 mx-auto flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
			<div className="flex items-center justify-between gap-8 border-b-2 pb-2">
				<div className="flex items-center justify-between gap-6 w-full">
					<div className="flex items-center gap-2">
						<h2 className="text-2xl font-bold">PAGOS</h2>
						<Suspense fallback={<span>...</span>}>
							<PagosQuantity />
						</Suspense>
					</div>
					<PagosFilter />
					<Link
						className="border px-2 py-1 rounded-lg bg-accent flex items-center gap-2"
						to="/admin/pagos/create-pago"
					>
						<Plus size={14} />
						Pago
					</Link>
				</div>
			</div>
			<Suspense fallback={<PagosSkelton />}>
				<PagosList />
			</Suspense>
		</article>
	)
}

const PagosQuantity = () => {
	const { data: items } = useSuspenseQuery(pagosQueryOptions)
	const {
		"periodo-desde": periodoDesde,
		"periodo-hasta": periodoHasta,
		rubro,
		sector,
	} = useSearch({ from: "/admin/pagos/" })
	const sortedItems = sortByPeriodo(
		filteredItems(items || [], periodoDesde, periodoHasta, rubro, sector)
	)
	return (
		<span className="text-lg text-muted-foreground">
			( {sortedItems.length} )
		</span>
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
