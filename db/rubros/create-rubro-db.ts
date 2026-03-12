import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { rubros, RubroType } from "db/pagos/schema"

export async function createRubroDB(newRubro: RubroType) {
	try {
		await delay()
		return await db.insert(rubros).values(newRubro).returning()
	} catch (error) {
		console.error(
			"ERROR insertando rubro:",
			error instanceof Error ? error.message : error
		)
	}
}
