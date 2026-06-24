import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { desc, eq } from "drizzle-orm"

export async function getPagosBySectorDB({ sector }: { sector: string }) {
	try {
		return await db
			.select()
			.from(pagos)
			.where(eq(pagos.sector, sector))
			.orderBy(desc(pagos.periodo))
			.limit(12)
	} catch (error) {
		console.error(
			"ERROR obteniendo pagos por sector:",
			error instanceof Error ? error.message : error
		)
		return []
	}
}
