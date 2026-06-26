import LinksEdit from "@/components/admin/links/links-edit"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const SearchSchema = z.object({
	id: z.coerce.string(),
})

export const Route = createFileRoute("/admin/links/edit-link")({
	component: RouteComponent,
	validateSearch: search => SearchSchema.parse(search),
})

function RouteComponent() {
	const { id } = Route.useSearch()

	return <>{id ? <LinksEdit itemId={id} /> : <p>Link sin ID en url</p>}</>
}
