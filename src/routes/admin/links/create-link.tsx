import LinksCreate from "@/components/admin/links/links-create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/links/create-link")({
	component: RouteComponent,
})

function RouteComponent() {
	return <LinksCreate />
}
