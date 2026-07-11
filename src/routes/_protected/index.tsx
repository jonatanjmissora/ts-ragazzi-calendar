import { createFileRoute } from "@tanstack/react-router"
import DashboardPagosPendientes from "@/components/dashboard/pagos-pendientes"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { OfflineRouteBlock } from "@/components/offline-route-block"
import { SessionDebug } from "@/components/session-debug"
import { isOfflineNoCacheError } from "@/lib/offline/errors"
import { z } from "zod"

export const Route = createFileRoute("/_protected/")({
	validateSearch: z.object({
		rubro: z.string().optional(),
		sector: z.string().optional(),
	}),
	component: App,
	errorComponent: ({ error }) =>
		isOfflineNoCacheError(error) ? <OfflineRouteBlock /> : <DefaultCatchBoundary error={error} />,
})

function App() {
	return (
		<>
			<SessionDebug />
			<DashboardPagosPendientes />
		</>
	)
}
