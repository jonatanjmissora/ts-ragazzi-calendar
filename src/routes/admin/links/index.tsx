import LinksList from "@/components/admin/links/links-list"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Suspense } from "react"

export const Route = createFileRoute("/admin/links/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<article className="sm:w-3/4 2xl:w-2/3 mx-auto flex flex-col gap-4 p-6 border rounded-lg shadow bg-accent">
			<div className="flex items-center justify-between gap-8 border-b-2 pb-2">
				<h2 className="text-2xl font-bold">LINKS</h2>
				<Link
					className="border px-2 py-1 rounded-lg bg-accent flex items-center gap-2"
					to="/admin/links/create-link"
				>
					<Plus size={14} />
					Link
				</Link>
			</div>
			<Suspense fallback={<LinksSkeleton />}>
				<LinksList />
			</Suspense>
		</article>
	)
}

const LinksSkeleton = () => (
	<div className="flex flex-col gap-2">
		{Array.from({ length: 3 }).map((_, index) => (
			<div
				key={index}
				className="my-1 py-1 rounded-xl shadow h-14 bg-accent/50 animate-pulse"
			></div>
		))}
	</div>
)
