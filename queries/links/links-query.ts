import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { getLinkByIdServer } from "server/links/get-link-by-id-server"
import { getLinksServer } from "server/links/get-links-server"

export const linksQueryOptions = queryOptions({
	queryKey: queryKeys.links.all,
	queryFn: () => getLinksServer(),
	staleTime: 60 * 1000,
	refetchInterval: 60 * 1000,
})

export const linkQueryOptions = (itemId: string) =>
	queryOptions({
		queryKey: queryKeys.links.byId(itemId),
		queryFn: () => getLinkByIdServer({ data: { id: itemId } }),
	})
