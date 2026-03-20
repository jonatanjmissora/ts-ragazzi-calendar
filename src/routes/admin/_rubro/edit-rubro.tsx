import RubrosEdit from "@/components/admin/rubros/rubros-edit"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const SearchSchema = z.object({
	id: z.coerce.string(),
})

export const Route = createFileRoute("/admin/_rubro/edit-rubro")({
	component: RouteComponent,
	validateSearch: search => SearchSchema.parse(search),
})

function RouteComponent() {
	const { id } = Route.useSearch()

	return <>{id ? <RubrosEdit itemId={id} /> : <p>Rubro sin ID en url</p>}</>
}
