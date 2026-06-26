import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { LinkType } from "db/schema"
import { deleteLinkServer } from "server/links/delete-link-server"

export function useDeleteLink(linkId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: { id: string } }) =>
			deleteLinkServer({ data }),
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: queryKeys.links.byId(linkId) })
			queryClient.setQueryData<LinkType[]>(queryKeys.links.all, oldItems => {
				if (!oldItems) return oldItems
				return oldItems.filter(item => item.id !== linkId)
			})
			queryClient.invalidateQueries({
				queryKey: queryKeys.links.all,
				refetchType: "active",
			})
		},
	})
}
