import PagosFilter from "@/components/admin/pagos/pagos-filter/pagos-filter"
import PagosList from "@/components/admin/pagos/pagos-list"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"
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
				<div className="flex items-center gap-4">
					<h2 className="text-2xl font-bold">PAGOS</h2>
					<PagosFilter />
				</div>
				<Link
					className="border px-2 py-1 rounded-lg bg-accent flex items-center gap-2"
					to="/admin/pagos/create-pago"
				>
					<Plus size={14} />
					Pago
				</Link>
			</div>
			<Suspense fallback={<AdminSkelton />}>
				<PagosList />
			</Suspense>
		</article>
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
