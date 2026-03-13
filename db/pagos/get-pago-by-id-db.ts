import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { eq } from "drizzle-orm"

export async function getPagoByIdDB(itemId: string) {
	try {
		await delay()
		const result = await db.select().from(pagos).where(eq(pagos.id, itemId))
		return result[0] // Return the first (and only) result
	} catch (error) {
		console.error(
			"ERROR obteniendo pago:",
			error instanceof Error ? error.message : error
		)
	}
}
