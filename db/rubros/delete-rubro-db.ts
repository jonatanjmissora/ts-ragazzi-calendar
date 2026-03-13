import { rubros } from "db/schema"
import { and, eq } from "drizzle-orm"
import { delay } from "@/lib/utils"
import { db } from "db/drizzle"

export async function deleteRubroDB(rubroId: string) {
	try {
		await delay()
		return await db
			.delete(rubros)
			.where(and(eq(rubros.id, rubroId)))
			.returning()
	} catch (error) {
		console.error(
			"ERROR eliminando pago:",
			error instanceof Error ? error.message : error
		)
	}
}
