import PagosFilter from "@/components/admin/pagos/pagos-filter/pagos-filter"
import PagosList from "@/components/admin/pagos/pagos-list"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
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
		<article className="w-2/3 mx-auto flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
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
			<Suspense fallback={<AdminSkelton />}>
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

const AdminSkelton = () => {
	return (
		<div className="flex flex-col gap-3 w-3/4">
			{[1, 2].map(item => (
				<Card className="w-full h-14 bg-muted animate-pulse" key={item}>
					<CardTitle></CardTitle>
					<CardContent></CardContent>
				</Card>
			))}
		</div>
	)
}
