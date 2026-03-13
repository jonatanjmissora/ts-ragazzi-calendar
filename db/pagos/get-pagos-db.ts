import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { desc } from "drizzle-orm"

export async function getPagosDB() {
	try {
		await delay()
		return await db.select().from(pagos).orderBy(desc(pagos.periodo))
	} catch (error) {
		console.error(
			"ERROR obteniendo pagos:",
			error instanceof Error ? error.message : error
		)
	}
}
