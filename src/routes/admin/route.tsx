import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import { adminRoute } from "@/lib/admin-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import SectionContainer from "@/components/layout/section-container"
import { Aside } from "@/components/layout/aside"

export const Route = createFileRoute("/admin")<RouterContext>({
	loader: async ({ context }) => {
		await adminRoute()
		context.queryClient.ensureQueryData(rubrosQueryOptions)
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex-1">
			<SectionContainer>
				<div className="w-full flex">
					<Aside>
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
								activeOptions={{ exact: true }}
								className="border border-transparent hover:bg-background/60 bg-background my-3 p-3 px-6 rounded-lg shadow block font-semibold text-sm tracking-widest"
							>
								PAGOS
							</Link>
						</nav>
					</Aside>
					<article className="w-[80dvw] py-20">
						<Outlet />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}
