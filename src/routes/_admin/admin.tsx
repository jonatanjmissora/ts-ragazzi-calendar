import SectionContainer from "@/components/layout/section-container"
import PagosForm from "@/components/pagos/pagos-create"
import PagosList from "@/components/pagos/pagos-list"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/admin")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer>
			<PagosForm />
			<PagosList />
		</SectionContainer>
	)
}
