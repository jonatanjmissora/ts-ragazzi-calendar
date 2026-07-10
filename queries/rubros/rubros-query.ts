import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { getRubroByIdServer } from "server/rubros/get-rubro-by-id-server"
import { getRubrosServer } from "server/rubros/get-rubros-server"
import { saveRubrosToCache, getCachedRubros } from "@/lib/offline/db"
import { OfflineNoCacheError } from "@/lib/offline/errors"

const isClient = typeof window !== "undefined"

export const rubrosQueryOptions = queryOptions({
	queryKey: queryKeys.rubros.all,
	queryFn: async ({ queryKey, client }) => {
		if (isClient) {
			const cached = await getCachedRubros()
			if (cached.length > 0) {
				getRubrosServer()
					.then(async (data) => {
						await saveRubrosToCache(data)
						client.setQueryData(queryKey, data)
					})
					.catch(() => {})
				return cached
			}
		}
		try {
			const data = await getRubrosServer()
			if (isClient) await saveRubrosToCache(data)
			return data
		} catch {
			throw new OfflineNoCacheError()
		}
	},
	staleTime: 60 * 1000,
	refetchInterval: 60 * 1000,
	networkMode: "always",
})

export const rubroQueryOptions = (itemId: string) =>
	queryOptions({
		queryKey: queryKeys.rubros.byId(itemId),
		queryFn: async ({ queryKey, client }) => {
			if (isClient) {
				const rubros = await getCachedRubros()
				const cached = rubros.find((r) => r.id === itemId)
				if (cached) {
					getRubroByIdServer({ data: { id: itemId } })
						.then(async (data) => {
							if (data) {
								const updated = rubros.map((r) =>
									r.id === itemId ? data : r
								)
								await saveRubrosToCache(updated)
								client.setQueryData(queryKey, data)
							}
						})
						.catch(() => {})
					return cached
				}
			}
			try {
				const data = await getRubroByIdServer({
					data: { id: itemId },
				})
				if (isClient && data) {
					const all = await getCachedRubros()
					await saveRubrosToCache([...all, data])
				}
				return data
			} catch {
				throw new OfflineNoCacheError()
			}
		},
		networkMode: "always",
	})
