import type { QueryClient } from "@tanstack/react-query"
import {
	getMutationQueue,
	removeMutationFromQueue,
	getPendingCount,
	clearPagosCache,
} from "./db"
import { sortPagos } from "queries/pagos/pagos-query"
import { createPagoServer } from "server/pagos/create-pago-server"
import { updatePagoServer } from "server/pagos/update-pago-server"
import { deletePagoServer } from "server/pagos/delete-pago-server"

let isSyncing = false

async function processOneMutation(entry: {
	id?: number
	type: "create" | "update" | "delete"
	payload: any
}) {
	switch (entry.type) {
		case "create":
			return await createPagoServer({ data: entry.payload })
		case "update":
			return await updatePagoServer({ data: entry.payload })
		case "delete":
			return await deletePagoServer({ data: { id: entry.payload.id } })
	}
}

function updatePagosCache(
	queryClient: QueryClient,
	type: "create" | "update" | "delete",
	result: any,
	payload?: any,
) {
	const queryCache = queryClient.getQueryCache()
	const pagosQueries = queryCache.getAll().filter(q => {
		const k = q.queryKey
		return (
			Array.isArray(k) &&
			(typeof k[0] === "string" || typeof k[0] === "symbol") &&
			String(k[0]).startsWith("pagos")
		)
	})

	for (const query of pagosQueries) {
		const key = query.queryKey
		const data = query.state.data

		if (!data) continue

		if (key.length === 2 && key[0] === "pagos" && typeof key[1] === "string") {
			// ["pagos", id]
			if (type === "update" && key[1] === result.id) {
				queryClient.setQueryData(key, result)
			}
			continue
		}

		if (!Array.isArray(data)) continue

		if (key.length === 1 && key[0] === "pagos") {
			// ["pagos"] — flat list of all pagos
			if (type === "create") {
				const filtered = payload ? data.filter((p: any) => p.id !== payload.id) : data
				queryClient.setQueryData(key, sortPagos([...filtered, result]))
			} else if (type === "update") {
				queryClient.setQueryData(
					key,
					sortPagos(data.map((p: any) => (p.id === result.id ? result : p))),
				)
			} else if (type === "delete") {
				queryClient.setQueryData(
					key,
					data.filter((p: any) => p.id !== result.id),
				)
			}
			continue
		}

		if (key[0] === "pagos-by-periodo" || key[0] === "pagos-by-sector") {
			// ["pagos-by-periodo", start, end]
			// ["pagos-by-sector", sector, rubro]
			if (type === "create") {
				const filtered = payload ? data.filter((p: any) => p.id !== payload.id) : data
				queryClient.setQueryData(key, sortPagos([result, ...filtered]))
			} else if (type === "update") {
				queryClient.setQueryData(
					key,
					sortPagos(data.map((p: any) => (p.id === result.id ? result : p))),
				)
			} else if (type === "delete") {
				queryClient.setQueryData(
					key,
					data.filter((p: any) => p.id !== result.id),
				)
			}
			continue
		}

		// ["pagos", "page", page, pageSize, filter]
		if (key.length >= 3 && key[0] === "pagos" && key[1] === "page") {
			if (type === "create") {
				const filtered = payload ? data.filter((p: any) => p.id !== payload.id) : data
				queryClient.setQueryData(key, sortPagos([result, ...filtered]))
			} else if (type === "update") {
				queryClient.setQueryData(
					key,
					sortPagos(data.map((p: any) => (p.id === result.id ? result : p))),
				)
			} else if (type === "delete") {
				queryClient.setQueryData(
					key,
					data.filter((p: any) => p.id !== result.id),
				)
			}
			continue
		}
	}
}

/**
 * Procesa la cola de mutaciones pendientes.
 *
 * Si un item falla (datos invalidos o red), se deja en la cola y se continúa
 * con el siguiente: no queremos que un item problematico atasque a los validos
 * que vienen despues. Los errores de red transitorios dejan todo pendiente para
 * reintentar en el proximo sync.
 *
 * Al terminar, si `queryClient` fue provisto, actualiza el cache de React Query
 * con los resultados del servidor para evitar un refetch innecesario.
 *
 * Devuelve true si la cola quedo vacia (todo sincronizado).
 */
export async function processMutationQueue(queryClient?: QueryClient): Promise<boolean> {
	if (isSyncing) return false

	const count = await getPendingCount()
	if (count === 0) return false

	isSyncing = true

	const results: { type: "create" | "update" | "delete"; result: any; payload: any }[] = []

	try {
		const queue = await getMutationQueue()
		for (const entry of queue) {
			try {
				const result = await processOneMutation(entry)
				results.push({ type: entry.type, result, payload: entry.payload })
				if (entry.id != null) {
					await removeMutationFromQueue(entry.id)
				}
			} catch {
				// Item fallido: queda en la cola, seguimos con el siguiente.
			}
		}
	} finally {
		isSyncing = false
	}

	const remaining = await getPendingCount()

	if (remaining === 0) {
		await clearPagosCache()

		// Sincroniza el cache de React Query sin refetchear al servidor,
		// ya que somos la unica fuente de verdad.
		if (queryClient) {
			for (const { type, result, payload } of results) {
				updatePagosCache(queryClient, type, result, payload)
			}
		}
	}

	return remaining === 0
}
