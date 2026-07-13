import { createFileRoute, redirect } from "@tanstack/react-router"
import { lazy, Suspense } from "react"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { pagosQueryOptions } from "queries/pagos/pagos-query"
import { AppLayout } from "@/components/shared/app-layout"
import { z } from "zod"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { OfflineRouteBlock } from "@/components/offline-route-block"
import { isOfflineNoCacheError } from "@/lib/offline/errors"

const DashboardCreatePago = lazy(
	() => import("@/components/dashboard/create-pago")
)

export const Route = createFileRoute("/_protected")({
	validateSearch: z.object({
		mes: z.coerce.number().int().min(0).max(11).optional(),
		anio: z.coerce.number().int().optional(),
	}),
	beforeLoad: async ({ context }) => {
		if (!context.session) {
			if (typeof document !== "undefined" && !navigator.onLine) {
				return
			}
			throw redirect({ to: "/login" })
		}
	},
	errorComponent: ({ error }) =>
		isOfflineNoCacheError(error) ? <OfflineRouteBlock /> : <DefaultCatchBoundary error={error} />,
	loader: async ({ context }) => {
		context.queryClient.prefetchQuery(rubrosQueryOptions)
		context.queryClient.prefetchQuery(pagosQueryOptions)
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<AppLayout
			asideContent={
				<Suspense
					fallback={
						<div className="p-4 text-center text-sm text-foreground/50">
							Cargando...
						</div>
					}
				>
					<DashboardCreatePago />
				</Suspense>
			}
		/>
	)
}
