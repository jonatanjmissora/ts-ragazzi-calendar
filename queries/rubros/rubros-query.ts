import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "queries/query-keys"
import { getRubroByIdServer } from "server/rubros/get-rubro-by-id-server"
import { getRubrosServer } from "server/rubros/get-rubros-server"
import { saveRubrosToCache, getCachedRubros } from "@/lib/offline/db"

const isClient = typeof window !== "undefined"

export const rubrosQueryOptions = queryOptions({
	queryKey: queryKeys.rubros.all,
	queryFn: async () => {
		if (isClient) {
			if (navigator.onLine) {
				try {
					const data = await getRubrosServer()
					await saveRubrosToCache(data)
					return data
				} catch {}
			}
			const cached = await getCachedRubros()
			if (cached.length > 0) return cached
			// Sin cache offline: retornar [] en vez de error — rubros son datos
			// de referencia para dropdowns, no bloquean la pantalla.
			return []
		}
		const data = await getRubrosServer()
		return data
	},
	refetchOnMount: "always",
	refetchOnFocus: false,
	refetchOnReconnect: false,
	networkMode: "always",
})

export const rubroQueryOptions = (itemId: string) =>
	queryOptions({
		queryKey: queryKeys.rubros.byId(itemId),
		queryFn: async () => {
			if (isClient) {
				if (navigator.onLine) {
					try {
						const data = await getRubroByIdServer({ data: { id: itemId } })
						if (data) {
							const all = await getCachedRubros()
							await saveRubrosToCache([...all, data])
						}
						return data
					} catch {}
				}
				const rubros = await getCachedRubros()
				return rubros.find((r) => r.id === itemId)
			}
			const data = await getRubroByIdServer({ data: { id: itemId } })
			return data
		},
		refetchOnMount: "always",
		refetchOnFocus: false,
		refetchOnReconnect: false,
		networkMode: "always",
	})
