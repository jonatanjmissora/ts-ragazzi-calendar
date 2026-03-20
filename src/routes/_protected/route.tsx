import { createFileRoute, Outlet } from "@tanstack/react-router"
import { protectedRoute } from "@/lib/protected-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { pagosQueryOptions } from "queries/pagos/pagos-query"
import SectionContainer from "../../components/layout/section-container"
import { Aside } from "@/components/layout/aside"
import DashboardCreatePago from "@/components/dashboard/create-pago"

export const Route = createFileRoute("/_protected")({
	loader: async ({ context }) => {
		await protectedRoute()
		context.queryClient.ensureQueryData(rubrosQueryOptions)
		context.queryClient.ensureQueryData(pagosQueryOptions)
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex-1">
			<SectionContainer>
				<div className="w-full flex">
					<Aside>
						<DashboardCreatePago />
					</Aside>
					<article className="w-[80dvw] py-20">
						<Outlet />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}
