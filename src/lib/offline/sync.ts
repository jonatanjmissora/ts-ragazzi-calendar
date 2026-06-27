import {
	getMutationQueue,
	removeMutationFromQueue,
	getPendingCount,
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
				break
			}
		}
	} finally {
		isSyncing = false
	}

	const remaining = await getPendingCount()
	return remaining === 0
}

export function startSyncListener() {
	if (typeof window === "undefined") return

	window.addEventListener("online", () => {
		processMutationQueue()
	})

	if (navigator.onLine) {
		processMutationQueue()
	}
}
