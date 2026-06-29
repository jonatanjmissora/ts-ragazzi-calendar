import {
	getMutationQueue,
	removeMutationFromQueue,
	getPendingCount,
	clearPagosCache,
} from "./db"
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
			await createPagoServer({ data: entry.payload })
			break
		case "update":
			await updatePagoServer({ data: entry.payload })
			break
		case "delete":
			await deletePagoServer({ data: { id: entry.payload.id } })
			break
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
 * Devuelve true si la cola quedo vacia (todo sincronizado).
 */
export async function processMutationQueue(): Promise<boolean> {
	if (isSyncing) return false

	const count = await getPendingCount()
	if (count === 0) return false

	isSyncing = true

	try {
		const queue = await getMutationQueue()
		for (const entry of queue) {
			try {
				await processOneMutation(entry)
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

	// Si todo sincronizo, limpiamos el cache de lectura para que la proxima
	// lectura online repueble con los datos reales del server (incluidos los
	// IDs definitivos de los pagos creados offline).
	if (remaining === 0) {
		await clearPagosCache()
	}

	return remaining === 0
}
