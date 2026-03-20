import { createFileRoute } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import SectionContainer from "@/components/layout/section-container"
import DashboardCreatePago from "@/components/dashboard/create-pago"
import DashboardPagosPendientes from "@/components/dashboard/pagos-pendientes"
import DashboardMenu from "@/components/dashboard/dashboard-menu"
import { Logo } from "@/components/layout/logo"

export const Route = createFileRoute("/_protected/")<RouterContext>({
	component: App,
})

function App() {
	return (
		<div className="flex-1">
			<SectionContainer>
				<div className="w-full flex">
					<aside className="w-[20dvw] h-screen sticky top-0 left-0 py-10 px-6 flex flex-col justify-between gap-20 border shadow bg-accent">
						<div className="flex flex-col sm:gap-20 2xl:gap-40">
							<DashboardMenu />
							<DashboardCreatePago />
						</div>
						<Logo />
					</aside>
					<article className="w-[80dvw] py-20">
						<DashboardPagosPendientes />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}
