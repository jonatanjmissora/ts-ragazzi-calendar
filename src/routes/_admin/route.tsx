import { createFileRoute, Outlet } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import { adminRoute } from "@/lib/admin-route"

export const Route = createFileRoute("/_admin")<RouterContext>({
	loader: async () => await adminRoute(),
	component: RouteComponent,
})

function RouteComponent() {
	return <Outlet />
}
