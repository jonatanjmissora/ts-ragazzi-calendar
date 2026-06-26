import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { LinkType } from "db/schema"
import { updateLinkServer } from "server/links/update-link-server"

export function useUpdateLink() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ data }: { data: LinkType }) => updateLinkServer({ data }),
		onSuccess: data => {
			if (!data) return
			queryClient.setQueryData<LinkType>(queryKeys.links.byId(data.id), data)
			queryClient.setQueryData<LinkType[]>(queryKeys.links.all, oldLinks => {
				if (!oldLinks) return oldLinks
				return oldLinks.map(r => (r.id === data.id ? data : r))
			})
			queryClient.invalidateQueries({
				queryKey: queryKeys.links.all,
				refetchType: "active",
			})
		},
	})
}
