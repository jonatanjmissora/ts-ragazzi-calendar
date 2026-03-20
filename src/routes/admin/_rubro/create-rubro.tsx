import RubrosCreate from "@/components/admin/rubros/rubros-create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/_rubro/create-rubro")({
	component: RouteComponent,
})

function RouteComponent() {
	return <RubrosCreate />
}
