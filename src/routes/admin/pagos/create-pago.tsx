import SectionContainer from "@/components/layout/section-container"
import PagosCreate from "@/components/admin/pagos/pagos-create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/pagos/create-pago")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer>
			<PagosCreate />
		</SectionContainer>
	)
}
