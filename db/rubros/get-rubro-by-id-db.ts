import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { rubros } from "db/schema"
import { eq } from "drizzle-orm"

export async function getRubroByIdDB(itemId: string) {
	try {
		await delay()
		const result = await db.select().from(rubros).where(eq(rubros.id, itemId))
		return result[0] // Return the first (and only) result
	} catch (error) {
		console.error(
			"ERROR obteniendo rubro:",
			error instanceof Error ? error.message : error
		)
	}
}
