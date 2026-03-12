import SectionContainer from "@/components/layout/section-container"
import RubrosCreate from "@/components/rubros/rubros-create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/create-rubro/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer>
			<RubrosCreate />
		</SectionContainer>
	)
}
