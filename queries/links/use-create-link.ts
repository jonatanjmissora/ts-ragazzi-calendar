import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { LinkFormType } from "db/links/link-validator"
import { createLinkServer } from "server/links/create-link-server"

export function useCreateLink() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createLinkServer,
		onSuccess: async data => {
			queryClient.setQueryData<LinkFormType[]>(
				queryKeys.links.all,
				oldLinks => {
					if (!oldLinks) return oldLinks
					return [data, ...oldLinks]
				}
			)
			queryClient.invalidateQueries({
				queryKey: queryKeys.links.all,
				refetchType: "active",
			})
		},
	})
}
