import { createFileRoute } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import SectionContainer from "@/components/layout/section-container"
import DashboardCreatePago from "@/components/dashboard/create-pago"
import DashboardPagosPendientes from "@/components/dashboard/pagos-pendientes"

export const Route = createFileRoute("/_protected/")<RouterContext>({
	component: App,
})

function App() {
	return (
		<div className="flex-1">
			<SectionContainer>
				<div className="w-full flex gap-10">
					<aside className="flex-5-12">
						<DashboardCreatePago />
					</aside>
					<article className="flex-2/3">
						<DashboardPagosPendientes />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}
