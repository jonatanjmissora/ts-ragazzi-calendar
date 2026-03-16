import { createFileRoute, Outlet } from "@tanstack/react-router"
import { protectedRoute } from "@/lib/protected-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { pagosQueryOptions } from "queries/pagos/pagos-query"

export const Route = createFileRoute("/_protected")({
	loader: async ({ context }) => {
		await protectedRoute()
		context.queryClient.ensureQueryData(rubrosQueryOptions)
		context.queryClient.ensureQueryData(pagosQueryOptions)
	},
	component: RouteComponent,
})

function RouteComponent() {
	return <Outlet />
}
