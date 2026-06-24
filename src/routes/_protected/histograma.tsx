import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { pagosBySectorQueryOptions } from "queries/pagos/pagos-query"
import { z } from "zod"
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	LabelList,
} from "recharts"
import { montoFormat } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_protected/histograma")({
	validateSearch: z.object({
		sector: z.string(),
		rubro: z.string(),
	}),
	component: RouteComponent,
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
				<Link to="/">
					<Button variant="ghost" size="icon">
						<ArrowLeft size={20} />
					</Button>
				</Link>
				<h1 className="text-2xl font-semibold text-foreground flex-1 text-center">
					{sector.toUpperCase()} — {rubro.toLocaleUpperCase()}
				</h1>
			</div>
			<div className="w-[200dvw] sm:w-full h-[60vh]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
						<XAxis dataKey="monthLabel" tick={{ fill: "var(--foreground)" }} />
						<YAxis
							tickFormatter={v => montoFormat(v)}
							tick={{ fill: "var(--foreground)" }}
						/>
						<Bar dataKey="monto" fill={`var(--${rubro})`} radius={[4, 4, 0, 0]}>
							<LabelList
								dataKey="monto"
								position="top"
								formatter={montoFormat as any}
								fill="var(--foreground)"
								style={{ fontSize: "12px" }}
							/>
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
