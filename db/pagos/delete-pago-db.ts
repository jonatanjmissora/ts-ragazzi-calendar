import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { and, eq } from "drizzle-orm"

export async function deletePagoDB(pagoId: string) {
	return dbOp(
		() => db.delete(pagos).where(and(eq(pagos.id, pagoId))).returning(),
		"deletePagoDB"
	)
}
