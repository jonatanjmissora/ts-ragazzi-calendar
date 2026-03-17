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
				<div className="w-full flex">
					<aside className="w-[20dvw] h-screen py-10 px-6 flex flex-col justify-between gap-20 border shadow bg-accent">
						<h2>RAGAZZI</h2>
						<DashboardCreatePago />
						<h3>Menú</h3>
					</aside>
					<article className="w-[80dvw] py-10">
						<DashboardPagosPendientes />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}
