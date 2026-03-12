import { delay } from "@/lib/utils"
import { pagos, PagoType } from "./schema"
import { db } from "db/drizzle"

export async function createPagoDB(newPago: PagoType) {
	try {
		await delay()
		return await db.insert(pagos).values(newPago).returning()
	} catch (error) {
		console.error(
			"ERROR insertando pago:",
			error instanceof Error ? error.message : error
		)
	}
}
