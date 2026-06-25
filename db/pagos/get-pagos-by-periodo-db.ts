import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { desc, and, gte, lt } from "drizzle-orm"

export async function getPagosByPeriodoDB(start: number, end: number) {
	return dbOp(
		() =>
			db
				.select()
				.from(pagos)
				.where(and(gte(pagos.periodo, start), lt(pagos.periodo, end)))
				.orderBy(desc(pagos.periodo)),
		"getPagosByPeriodoDB"
	)
}
