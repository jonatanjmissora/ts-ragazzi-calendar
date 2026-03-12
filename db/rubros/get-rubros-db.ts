import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { rubros } from "db/schema"
import { desc } from "drizzle-orm"

export async function getRubrosDB() {
	try {
		await delay()
		return await db.select().from(rubros).orderBy(desc(rubros.nombre))
	} catch (error) {
		console.error(
			"ERROR obteniendo rubros:",
			error instanceof Error ? error.message : error
		)
	}
}
