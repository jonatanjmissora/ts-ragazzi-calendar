import { createFileRoute } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import SectionContainer from "@/components/layout/section-container"
import DashboardCreatePago from "@/components/dashboard/create-pago"
import DashboardPagosPendientes from "@/components/dashboard/pagos-pendientes"
import { Aside } from "@/components/layout/aside"
import { z } from "zod"

export const Route = createFileRoute("/_protected/")<RouterContext>({
	validateSearch: z.object({
		rubro: z.string().optional(),
		sector: z.string().optional(),
	}),
	component: App,
})

function App() {
	return (
		<div className="flex-1">
			<SectionContainer>
				<div className="w-full flex">
					<Aside>
						<DashboardCreatePago />
					</Aside>
					<article className="w-[80dvw] py-20">
						<DashboardPagosPendientes />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}
