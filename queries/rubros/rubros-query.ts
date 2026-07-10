import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { getRubroByIdServer } from "server/rubros/get-rubro-by-id-server"
import { getRubrosServer } from "server/rubros/get-rubros-server"
import { saveRubrosToCache, getCachedRubros } from "@/lib/offline/db"
import { OfflineNoCacheError } from "@/lib/offline/errors"

const isClient = typeof window !== "undefined"

export const rubrosQueryOptions = queryOptions({
	queryKey: queryKeys.rubros.all,
	queryFn: async () => {
		try {
			const data = await getRubrosServer()
			if (isClient) {
				await saveRubrosToCache(data)
			}
			return data
		} catch {
			if (!isClient) throw new OfflineNoCacheError()
			const cached = await getCachedRubros()
			if (cached.length === 0) throw new OfflineNoCacheError()
			return cached
		}
	},
	staleTime: 60 * 1000,
	refetchInterval: 60 * 1000,
	networkMode: "always",
})

export const rubroQueryOptions = (itemId: string) =>
	queryOptions({
		queryKey: queryKeys.rubros.byId(itemId),
		queryFn: () => getRubroByIdServer({ data: { id: itemId } }),
	})
