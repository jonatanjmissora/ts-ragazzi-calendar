import { openDB, type IDBPDatabase } from "idb"

const DB_NAME = "ragazzi-offline"
const DB_VERSION = 2

export type MutationEntry = {
	id?: number
	type: "create" | "update" | "delete"
	payload: any
	createdAt: number
}

interface RagazziDB {
	"mutation-queue": {
		key: number
		value: MutationEntry
		indexes: { "by-created": number }
	}
}

let dbInstance: IDBPDatabase<RagazziDB> | null = null

export async function openRagazziDB(): Promise<IDBPDatabase<RagazziDB>> {
	if (dbInstance) {
		try {
			dbInstance.get("mutation-queue", 1)
			return dbInstance
		} catch {
			dbInstance = null
		}
	}

	dbInstance = await openDB<RagazziDB>(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion) {
			if (oldVersion < 2 && db.objectStoreNames.contains("pagos-cache")) {
				db.deleteObjectStore("pagos-cache")
			}
			if (!db.objectStoreNames.contains("mutation-queue")) {
				const queueStore = db.createObjectStore("mutation-queue", {
					keyPath: "id",
					autoIncrement: true,
				})
				queueStore.createIndex("by-created", "createdAt")
			}
		},
	})

	return dbInstance
}

export async function addMutationToQueue(
	type: MutationEntry["type"],
	payload: MutationEntry["payload"]
): Promise<void> {
	const db = await openRagazziDB()
	await db.add("mutation-queue", {
		type,
		payload,
		createdAt: Date.now(),
	})
}

export async function getPendingCount(): Promise<number> {
	const db = await openRagazziDB()
	return db.count("mutation-queue")
}

export async function getMutationQueue(): Promise<MutationEntry[]> {
	const db = await openRagazziDB()
	return db.getAll("mutation-queue")
}

export async function removeMutationFromQueue(id: number): Promise<void> {
	const db = await openRagazziDB()
	await db.delete("mutation-queue", id)
}
