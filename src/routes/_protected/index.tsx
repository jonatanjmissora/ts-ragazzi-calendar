import { createFileRoute } from "@tanstack/react-router"
import type { RouterContext } from "@/routes/__root"
import SectionContainer from "@/components/layout/section-container"
import DashboardCreatePago from "@/components/dashboard/create-pago"
import DashboardPagosPendientes from "@/components/dashboard/pagos-pendientes"
import DashboardMenu from "@/components/dashboard-menu"

export const Route = createFileRoute("/_protected/")<RouterContext>({
	component: App,
})

function App() {
	return (
		<div className="flex-1">
			<SectionContainer>
				<div className="w-full flex">
					<aside className="w-[20dvw] h-screen py-10 px-6 flex flex-col justify-between gap-20 border shadow bg-accent">
						<div className="flex flex-col gap-40">
							<DashboardMenu />
							<DashboardCreatePago />
						</div>
						<Logo />
					</aside>
					<article className="w-[80dvw] py-10">
						<DashboardPagosPendientes />
					</article>
				</div>
			</SectionContainer>
		</div>
	)
}

const Logo = () => {
	return (
		<article className="flex items-center">
			<div className="w-3/5">
				<img
					className="object-contain h-auto dark:hidden opacity-20"
					src="/logo-dark.svg"
					alt="Logo"
				/>
				<img
					className="object-contain h-auto hidden dark:block opacity-20"
					src="/logo-light.svg"
					alt="Logo"
				/>
			</div>
			<div className="w-full text-center flex flex-col gap-2 relative text-foreground/20">
				<h1 className="text-6xl font-bold tracking-wider">ragazzi</h1>
				<h3 className="absolute right-5 -bottom-1/3 font-semibold text-xl">
					vaqueria
				</h3>
			</div>
		</article>
	)
}
