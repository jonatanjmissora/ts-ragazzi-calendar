import RubrosList from "@/components/admin/rubros/rubros-list"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Suspense } from "react"

export const Route = createFileRoute("/admin/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<article className="sm:w-3/4 2xl:w-2/3 mx-auto flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
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
