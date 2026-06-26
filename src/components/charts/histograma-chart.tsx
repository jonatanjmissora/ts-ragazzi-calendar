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

type DataItem = {
	month: number
	monthLabel: string
	monto: number
	periodo: number
}

export function HistogramaChart({
	data,
	rubro,
}: {
	data: DataItem[]
	rubro: string
}) {
	return (
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
	)
}
