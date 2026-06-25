import PagosFilter from "@/components/admin/pagos/pagos-filter/pagos-filter"
import PagosList from "@/components/admin/pagos/pagos-list"
import { createFileRoute, Link, useSearch } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { getPagosCountServer } from "server/pagos/get-pagos-count-server"
import { queryKeys } from "queries/query-keys"
import z from "zod"

const pageSize = 50

const searchSchema = z.object({
	"periodo-desde": z.string().optional(),
	"periodo-hasta": z.string().optional(),
	rubro: z.string().optional(),
	sector: z.string().optional(),
	page: z.coerce.number().int().min(1).optional().default(1),
})

export const Route = createFileRoute("/admin/pagos/")({
	validateSearch: searchSchema,
	component: RouteComponent,
})

function RouteComponent() {
	const search = useSearch({ from: "/admin/pagos/" })
	const {
		page,
		"periodo-desde": periodoDesde,
		"periodo-hasta": periodoHasta,
		rubro,
		sector,
	} = search

	return (
		<article className="sm:w-3/4 2xl:w-2/3 mx-auto flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
			<div className="flex items-center justify-between gap-8 border-b-2 pb-2">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-10 sm:gap-6 w-full">
					<div className="flex items-center gap-2">
						<h2 className="text-2xl font-bold">PAGOS</h2>
						<Suspense fallback={<span>...</span>}>
							<PagosQuantity
								periodoDesde={periodoDesde}
								periodoHasta={periodoHasta}
								rubro={rubro}
								sector={sector}
							/>
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
			<Suspense fallback={<PagosSkeleton />}>
				<PagosList
					page={page}
					pageSize={pageSize}
					periodoDesde={periodoDesde}
					periodoHasta={periodoHasta}
					rubro={rubro}
					sector={sector}
				/>
			</Suspense>
		</article>
	)
}

const PagosQuantity = ({
	periodoDesde,
	periodoHasta,
	rubro,
	sector,
}: {
	periodoDesde?: string
	periodoHasta?: string
	rubro?: string
	sector?: string
}) => {
	const { data: total } = useQuery({
		queryKey: queryKeys.pagos.byPage(0, 0, {
			periodoDesde,
			periodoHasta,
			rubro,
			sector,
		}),
		queryFn: () =>
			getPagosCountServer({
				data: { periodoDesde, periodoHasta, rubro, sector },
			}),
	})
	return <span className="text-lg text-muted-foreground">( {total ?? 0} )</span>
}

const PagosSkeleton = () => {
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
					key={index}
					className={`my-1 py-1 rounded-xl shadow h-11 ${backgrounds[index as keyof typeof backgrounds]}`}
				></div>
			))}
		</div>
	)
}
