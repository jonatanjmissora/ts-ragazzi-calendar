import { createFileRoute } from "@tanstack/react-router"
import DashboardPagosPendientes from "@/components/dashboard/pagos-pendientes"
import { z } from "zod"

export const Route = createFileRoute("/_protected/")({
	validateSearch: z.object({
		rubro: z.string().optional(),
		sector: z.string().optional(),
		mes: z.coerce.number().int().min(0).max(11).optional(),
		anio: z.coerce.number().int().optional(),
	}),
	component: App,
})

function App() {
	return <DashboardPagosPendientes />
}
