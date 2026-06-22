import { createFileRoute } from "@tanstack/react-router"
import DashboardPagosPendientes from "@/components/dashboard/pagos-pendientes"
import { z } from "zod"

export const Route = createFileRoute("/_protected/")({
	validateSearch: z.object({
		rubro: z.string().optional(),
		sector: z.string().optional(),
	}),
	component: App,
})

function App() {
	return <DashboardPagosPendientes />
}
