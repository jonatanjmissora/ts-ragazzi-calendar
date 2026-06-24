import { createFileRoute, Outlet } from "@tanstack/react-router"
import { protectedRoute } from "@/lib/protected-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { pagosQueryOptions } from "queries/pagos/pagos-query"
import SectionContainer from "../../components/layout/section-container"
import { Aside } from "@/components/layout/aside"
import DashboardCreatePago from "@/components/dashboard/create-pago"
import { z } from "zod"

export const Route = createFileRoute("/_protected")({
	validateSearch: z.object({
		mes: z.coerce.number().int().min(0).max(11).optional(),
		anio: z.coerce.number().int().optional(),
	}),
	loader: async ({ context }) => {
		await protectedRoute()
		context.queryClient.prefetchQuery(rubrosQueryOptions)
		context.queryClient.prefetchQuery(pagosQueryOptions)
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex-1">
			<SectionContainer>
				<div className="w-full flex flex-col sm:flex-row">
					<Aside>
						<DashboardCreatePago />
					</Aside>
					<article className="w-full sm:w-[80dvw] py-20">
						<Outlet />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}
