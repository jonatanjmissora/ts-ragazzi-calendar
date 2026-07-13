import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { pagosBySectorQueryOptions } from "queries/pagos/pagos-query"
import { lazy, Suspense } from "react"
import { z } from "zod"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { OfflineRouteBlock } from "@/components/offline-route-block"
import { isOfflineNoCacheError } from "@/lib/offline/errors"

const HistogramaChart = lazy(() => import("@/components/charts/histograma-chart"))

export const Route = createFileRoute("/_protected/histograma")({
	validateSearch: z.object({
		sector: z.string(),
		rubro: z.string(),
	}),
	component: RouteComponent,
	errorComponent: ({ error }) =>
		isOfflineNoCacheError(error) ? <OfflineRouteBlock /> : <DefaultCatchBoundary error={error} />,
})

function RouteComponent() {
	const { sector, rubro } = Route.useSearch()
	const { data: pagosHistograma } = useSuspenseQuery(
		pagosBySectorQueryOptions(sector, rubro)
	)

	const data = (pagosHistograma || [])
		.map(p => ({
			month: Math.floor((p.periodo % 10000) / 100),
			monthLabel: String(Math.floor((p.periodo % 10000) / 100)).padStart(
				2,
				"0"
			),
			monto: p.monto,
			periodo: p.periodo,
		}))
		.sort((a, b) => a.month - b.month)

	return (
		<div
			className={`w-full h-[80svh] flex flex-col items-start justify-center px-5 sm:px-[10%] overflow-x-auto`}
		>
			<div className="w-full flex items-center gap-4 mb-6">
				<Link to="/" aria-label="Volver al inicio">
					<Button variant="ghost" size="icon">
						<ArrowLeft size={20} />
					</Button>
				</Link>
				<h1 className="text-2xl font-semibold text-foreground flex-1 text-center">
					{sector.toUpperCase()} — {rubro.toLocaleUpperCase()}
				</h1>
			</div>
			<Suspense fallback={<div className="w-full h-[60vh] flex items-center justify-center text-foreground/50">Cargando gráfico...</div>}>
				<HistogramaChart data={data} rubro={rubro} />
			</Suspense>
		</div>
	)
}
