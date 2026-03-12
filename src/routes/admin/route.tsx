import { createFileRoute, Outlet } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import { adminRoute } from "@/lib/admin-route"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"

export const Route = createFileRoute("/admin")<RouterContext>({
	loader: async ({ context }) => {
		await adminRoute()
		context.queryClient.ensureQueryData(rubrosQueryOptions)
	},
	component: RouteComponent,
})

function RouteComponent() {
	return <Outlet />
}
