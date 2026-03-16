import { createFileRoute } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import SectionContainer from "@/components/layout/section-container"
import DashboardCreatePago from "@/components/dashboard/create-pago"

export const Route = createFileRoute("/_protected/")<RouterContext>({
	component: App,
})

function App() {
	return (
		<div className="flex-1">
			<SectionContainer>
				<div className="w-full flex gap-0">
					<aside className="flex-5-12 p-6 rounded-lg shadow">
						<DashboardCreatePago />
					</aside>
					<article className="flex-2/3 bg-blue-500">article</article>
				</div>
			</SectionContainer>
		</div>
	)
}
