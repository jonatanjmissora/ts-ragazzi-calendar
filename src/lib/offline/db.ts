import { openDB, type IDBPDatabase } from "idb"
import type { PagoType } from "db/pagos/schema"
import type { RubroType } from "db/rubros/schema"

const DB_NAME = "ragazzi-offline"
const DB_VERSION = 4

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
	"pagos-cache": {
		key: string
		value: PagoType
		indexes: { "by-periodo": number }
	}
	"rubros-cache": {
		key: string
		value: RubroType
	}
}

let dbInstance: IDBPDatabase<RagazziDB> | null = null

export async function openRagazziDB(): Promise<IDBPDatabase<RagazziDB>> {
	if (dbInstance) return dbInstance

	dbInstance = await openDB<RagazziDB>(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion) {
			// v2 elimino (si existia) un intento previo de pagos-cache.
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
			// v3 reintroduce pagos-cache, ahora para lectura offline por-entidad.
			if (oldVersion < 3 && !db.objectStoreNames.contains("pagos-cache")) {
				const pagosStore = db.createObjectStore("pagos-cache", {
					keyPath: "id",
				})
				pagosStore.createIndex("by-periodo", "periodo")
			}
			// v4 agrega rubros-cache para lectura offline (usado en edit-pago).
			if (oldVersion < 4 && !db.objectStoreNames.contains("rubros-cache")) {
				db.createObjectStore("rubros-cache", { keyPath: "id" })
			}
		},
	})

	return dbInstance
}

// ---------------------------------------------------------------------------
// Cola de mutaciones (escritura offline)
// ---------------------------------------------------------------------------

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

export async function clearMutationQueue(): Promise<void> {
	const db = await openRagazziDB()
	await db.clear("mutation-queue")
}

// ---------------------------------------------------------------------------
// Cache de lectura (pagos-cache)
// ---------------------------------------------------------------------------
// Por-entidad: una mutacion offline (create/update/delete) toca la entidad una
// vez y todas las lecturas la ven. El index by-periodo permite leer por rango.
// ---------------------------------------------------------------------------

/**
 * Reemplaza los pagos cacheados de un periodo por los nuevos.
 * Borra solo los del rango [start, end) y guarda los pasados.
 */
export async function savePagosByPeriodoToCache(
	start: number,
	end: number,
	pagos: PagoType[]
): Promise<void> {
	const db = await openRagazziDB()
	const tx = db.transaction("pagos-cache", "readwrite")
	const index = tx.store.index("by-periodo")
	const keys = await index.getAllKeys(
		IDBKeyRange.bound(start, end, false, true)
	)
	for (const key of keys) {
		await tx.store.delete(key)
	}
	for (const pago of pagos) {
		await tx.store.put(pago)
	}
	await tx.done
}

/** Upsert de un pago en el cache (para create/update offline). */
export async function putPagoInCache(pago: PagoType): Promise<void> {
	const db = await openRagazziDB()
	await db.put("pagos-cache", pago)
}

/** Elimina un pago del cache (para delete offline). */
export async function removePagoFromCache(id: string): Promise<void> {
	const db = await openRagazziDB()
	await db.delete("pagos-cache", id)
}

/** Lee todos los pagos cacheados. */
export async function getCachedPagos(): Promise<PagoType[]> {
	const db = await openRagazziDB()
	return db.getAll("pagos-cache")
}

/** Lee los pagos cacheados en el rango [start, end). */
export async function getCachedPagosByPeriodo(
	start: number,
	end: number
): Promise<PagoType[]> {
	const db = await openRagazziDB()
	return db.getAllFromIndex("pagos-cache", "by-periodo", IDBKeyRange.bound(start, end, false, true))
}

/** Lee un pago cacheado por id. */
export async function getCachedPagoById(id: string): Promise<PagoType | undefined> {
	const db = await openRagazziDB()
	return db.get("pagos-cache", id)
}

/** Lee pagos cacheados filtrados por sector y rubro. */
export async function getCachedPagosBySector(
	sector: string,
	rubro: string
): Promise<PagoType[]> {
	const all = await getCachedPagos()
	return all.filter(p => p.sector === sector && p.rubro === rubro)
}

/** Reemplaza todo el cache de pagos (para sync del listado completo). */
export async function saveAllPagosToCache(pagos: PagoType[]): Promise<void> {
	const db = await openRagazziDB()
	const tx = db.transaction("pagos-cache", "readwrite")
	await tx.store.clear()
	for (const pago of pagos) {
		await tx.store.put(pago)
	}
	await tx.done
}

/** Vacia todo el cache de pagos (tras un sync exitoso, para repoblar desde el server). */
export async function clearPagosCache(): Promise<void> {
	const db = await openRagazziDB()
	await db.clear("pagos-cache")
}

// ---------------------------------------------------------------------------
// Cache de lectura (rubros-cache)
// ---------------------------------------------------------------------------

export async function saveRubrosToCache(rubros: RubroType[]): Promise<void> {
	const db = await openRagazziDB()
	const tx = db.transaction("rubros-cache", "readwrite")
	for (const rubro of rubros) {
		await tx.store.put(rubro)
	}
	await tx.done
}

export async function getCachedRubros(): Promise<RubroType[]> {
	const db = await openRagazziDB()
	return db.getAll("rubros-cache")
}
