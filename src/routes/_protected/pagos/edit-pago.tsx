import PagosEdit from "@/components/layout/pagos-edit"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { OfflineRouteBlock } from "@/components/offline-route-block"
import { isOfflineNoCacheError } from "@/lib/offline/errors"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const SearchSchema = z.object({
	id: z.coerce.string(),
})

export const Route = createFileRoute("/_protected/pagos/edit-pago")({
	component: RouteComponent,
	validateSearch: search => SearchSchema.parse(search),
	errorComponent: ({ error }) =>
		isOfflineNoCacheError(error) ? <OfflineRouteBlock /> : <DefaultCatchBoundary error={error} />,
})

function RouteComponent() {
	const { id } = Route.useSearch()

	return <>{id ? <PagosEdit itemId={id} /> : <p>Pago sin ID en url</p>}</>
}
