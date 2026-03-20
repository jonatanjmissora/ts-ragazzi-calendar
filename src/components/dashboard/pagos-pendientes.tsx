import { useSuspenseQuery } from "@tanstack/react-query"
import { pagosByPeriodoQueryOptions } from "queries/pagos/pagos-query"
import { Suspense } from "react"
import { Card, CardContent, CardTitle } from "../ui/card"
import { Check, Ellipsis } from "lucide-react"
import { Button } from "../ui/button"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"

export default function DashboardPagosPendientes() {
	return (
		<article className="sm:w-3/4 2xl:w-2/3 mx-auto flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
			<h2 className="flex justify-around items-center gap-6 text-lg font-semibold">
				<span>vencimiento</span>
				<span>rubro</span>
				<span>sector</span>
				<span>monto</span>
				<span>menu</span>
			</h2>
			<Suspense fallback={<div>Cargando...</div>}>
				<PagosPendientesList />
			</Suspense>
		</article>
	)
}

function PagosPendientesList() {
	const { data: pagosFromPeriodo } = useSuspenseQuery(
		pagosByPeriodoQueryOptions
	)
	const { data: rubros } = useSuspenseQuery(rubrosQueryOptions)

	if (!pagosFromPeriodo || !rubros) {
		return <div>Cargando...</div>
	}

	const pagosPendientes = pagosFromPeriodo?.filter(item => item.pagado === 0)

	return (
		<div className="flex flex-col gap-2">
			{pagosPendientes?.map(item => (
				<Card
					className="flex gap-2 w-full p-1 relative text-xs 2xl:text-base bg-background"
					key={item.id}
				>
					<CardTitle></CardTitle>
					<CardContent className="flex items-center justify-around w-full">
						<span>{item.periodo}</span>
						<span>{item.rubro.toUpperCase()}</span>
						<span>{item.sector.toUpperCase()}</span>
						<span>{item.monto}</span>
						<div className="flex gap-2">
							<Button>
								<Check size={16} />
							</Button>
							<Button>
								<Ellipsis size={16} />
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
