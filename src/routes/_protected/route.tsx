import { createFileRoute, Outlet } from "@tanstack/react-router"
import { protectedRoute } from "@/lib/protected-route"

export const Route = createFileRoute("/_protected")({
	loader: async () => await protectedRoute(),
	component: RouteComponent,
})

function RouteComponent() {
	return <Outlet />
}
