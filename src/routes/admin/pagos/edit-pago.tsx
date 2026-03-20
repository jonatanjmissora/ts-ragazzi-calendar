import PagosEdit from "@/components/admin/pagos/pagos-edit"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const SearchSchema = z.object({
	id: z.coerce.string(),
})

export const Route = createFileRoute("/admin/pagos/edit-pago")({
	component: RouteComponent,
	validateSearch: search => SearchSchema.parse(search),
})

function RouteComponent() {
	const { id } = Route.useSearch()

	return <>{id ? <PagosEdit itemId={id} /> : <p>Pago sin ID en url</p>}</>
}
