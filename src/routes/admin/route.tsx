import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import { adminRoute } from "@/lib/admin-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import SectionContainer from "@/components/layout/section-container"
import AdminMenu from "@/components/admin/admin-menu"
import { Logo } from "@/components/layout/logo"

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
					<aside className="w-[20dvw] h-screen sticky top-0 left-0 py-10 px-6 flex flex-col justify-between gap-20 border shadow bg-accent">
						<div className="flex flex-col gap-40">
							<AdminMenu />
							<nav>
								<Link
									to="/"
									activeProps={{ className: "bg-background w-full" }}
									activeOptions={{ exact: true }}
									className="hover:bg-background/60 bg-background my-3 p-3 px-6 rounded-lg shadow block font-semibold text-sm tracking-widest"
								>
									DASHBOARD
								</Link>
								<Link
									to="/admin"
									activeProps={{ className: "bg-background w-full" }}
									activeOptions={{ exact: true }}
									className="hover:bg-background/60 bg-background my-3 p-3 px-6 rounded-lg shadow block font-semibold text-sm tracking-widest"
								>
									RUBROS
								</Link>
								<Link
									to="/admin/pagos"
									activeProps={{ className: "bg-background w-full" }}
									activeOptions={{ exact: true }}
									className="hover:bg-background/60 bg-background my-3 p-3 px-6 rounded-lg shadow block font-semibold text-sm tracking-widest"
								>
									PAGOS
								</Link>
							</nav>
						</div>
						<Logo />
					</aside>
					<article className="w-[80dvw] py-20">
						<Outlet />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}
