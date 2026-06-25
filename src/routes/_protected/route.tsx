import { createFileRoute } from "@tanstack/react-router"
import { protectedRoute } from "@/lib/protected-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { pagosQueryOptions } from "queries/pagos/pagos-query"
import { AppLayout } from "@/components/shared/app-layout"
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
		<AppLayout asideContent={<DashboardCreatePago />} />
	)
}
