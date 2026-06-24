import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { desc, eq, and } from "drizzle-orm"

export async function getPagosBySectorDB({
	sector,
	rubro,
}: {
	sector: string
	rubro: string
}) {
	try {
		return await db
			.select()
			.from(pagos)
			.where(and(eq(pagos.sector, sector), eq(pagos.rubro, rubro)))
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
