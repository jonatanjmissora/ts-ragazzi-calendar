import { createFileRoute, Outlet } from "@tanstack/react-router"
import { protectedRoute } from "@/lib/protected-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"

export const Route = createFileRoute("/_protected")({
	loader: async ({ context }) => {
		await protectedRoute()
		context.queryClient.ensureQueryData(rubrosQueryOptions)
		context.queryClient.ensureQueryData(rubrosQueryOptions)
	},
	component: RouteComponent,
})

function RouteComponent() {
	return <Outlet />
}
