import SectionContainer from "@/components/layout/section-container"
import PagosFilter from "@/components/pagos/pagos-filter/pagos-filter"
import PagosList from "@/components/pagos/pagos-list"
import RubrosList from "@/components/rubros/rubros-list"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Suspense } from "react"
import z from "zod"

export const Route = createFileRoute("/admin/")({
	validateSearch: z.object({
		"periodo-desde": z.string().optional(),
		"periodo-hasta": z.string().optional(),
	}),
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer className="gap-20">
			<article className="flex flex-col gap-8">
				<div className="flex items-center justify-between gap-8 border-b-2 pb-2">
					<h2 className="text-2xl font-bold">RUBROS</h2>
					<Link
						className="border px-2 py-1 rounded-lg bg-accent flex items-center gap-2"
						to="/admin/create-rubro"
					>
						<Plus size={14} />
						Rubro
					</Link>
				</div>
				<Suspense fallback={<AdminSkelton />}>
					<RubrosList />
				</Suspense>
			</article>
			<article className="flex flex-col gap-8">
				<div className="flex items-center justify-between gap-8 border-b-2 pb-2">
					<h2 className="text-2xl font-bold">PAGOS</h2>
					<PagosFilter />
					<Link
						className="border px-2 py-1 rounded-lg bg-accent flex items-center gap-2"
						to="/admin/create-pago"
					>
						<Plus size={14} />
						Pago
					</Link>
				</div>
				<Suspense fallback={<AdminSkelton />}>
					<PagosList />
				</Suspense>
			</article>
		</SectionContainer>
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
