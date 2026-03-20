import RubrosList from "@/components/admin/rubros/rubros-list"
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
			<Suspense fallback={<RubrosSkelton />}>
				<RubrosList />
			</Suspense>
		</article>
	)
}

const RubrosSkelton = () => {
	const backgrounds = {
		0: "bg-(--ragazzi)/65",
		1: "bg-(--patricios)/35",
		2: "bg-(--palihue)/50",
		3: "bg-(--jmolina)/20",
	} as const

	return (
		<div className="flex flex-col gap-2">
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={Math.random()}
					className={`my-1 py-1 rounded-xl shadow h-14 ${backgrounds[index as keyof typeof backgrounds]}`}
				></div>
			))}
		</div>
	)
}
