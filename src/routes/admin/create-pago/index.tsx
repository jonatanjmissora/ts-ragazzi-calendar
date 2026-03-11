import SectionContainer from "@/components/layout/section-container"
import PagosCreate from "@/components/pagos/pagos-create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/create-pago/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer>
			<PagosCreate />
		</SectionContainer>
	)
}
