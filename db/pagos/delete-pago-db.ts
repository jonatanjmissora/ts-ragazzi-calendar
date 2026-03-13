import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { and, eq } from "drizzle-orm"

export async function deletePagoDB(pagoId: string) {
	try {
		await delay()
		return await db
			.delete(pagos)
			.where(and(eq(pagos.id, pagoId)))
			.returning()
	} catch (error) {
		console.error(
			"ERROR eliminando pago:",
			error instanceof Error ? error.message : error
		)
	}
}
