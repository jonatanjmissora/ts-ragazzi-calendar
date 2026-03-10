import { createFileRoute, Outlet } from "@tanstack/react-router"
import { authRoute } from "@/lib/auth-route"

export const Route = createFileRoute("/_auth")({
	loader: async () => await authRoute(),
	component: RouteComponent,
})

function RouteComponent() {
	return <Outlet />
}
