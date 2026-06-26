import { createFileRoute, Link } from "@tanstack/react-router"
import { adminRoute } from "@/lib/admin-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { linksQueryOptions } from "queries/links/links-query"
import { AppLayout } from "@/components/shared/app-layout"

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		await adminRoute()
	},
	loader: async ({ context }) => {
		context.queryClient.prefetchQuery(rubrosQueryOptions)
		context.queryClient.prefetchQuery(linksQueryOptions)
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<AppLayout
			asideContent={
				<nav>
					<Link
						to="/"
						activeProps={{ className: "bg-background w-full" }}
						activeOptions={{ exact: true }}
						className="border border-transparent hover:bg-background/60 bg-background my-3 p-3 px-6 rounded-lg shadow block font-semibold text-sm tracking-widest"
					>
						DASHBOARD
					</Link>
					<Link
						to="/admin"
						activeProps={{
							className:
								"shadow-[0_0_6px_#00000090] dark:shadow-[0_0_6px_#ffffff30] w-full",
						}}
						activeOptions={{ exact: true }}
						className="hover:bg-background/60 bg-background my-3 p-3 px-6 rounded-lg shadow block font-semibold text-sm tracking-widest"
					>
						RUBROS
					</Link>
					<Link
						to="/admin/pagos"
						activeProps={{
							className:
								"shadow-[0_0_6px_#00000090] dark:shadow-[0_0_6px_#ffffff30] w-full",
						}}
						className="border border-transparent hover:bg-background/60 bg-background my-3 p-3 px-6 rounded-lg shadow block font-semibold text-sm tracking-widest"
					>
						PAGOS
					</Link>
					<Link
						to="/admin/links"
						activeProps={{
							className:
								"shadow-[0_0_6px_#00000090] dark:shadow-[0_0_6px_#ffffff30] w-full",
						}}
						className="border border-transparent hover:bg-background/60 bg-background my-3 p-3 px-6 rounded-lg shadow block font-semibold text-sm tracking-widest"
					>
						LINKS
					</Link>
				</nav>
			}
		/>
	)
}
