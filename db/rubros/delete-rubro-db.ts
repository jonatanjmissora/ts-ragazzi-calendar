import { rubros } from "db/schema"
import { and, eq } from "drizzle-orm"
import { db } from "db/drizzle"
import { dbOp } from "db/db-error-handler"

export async function deleteRubroDB(rubroId: string) {
	return dbOp(
		() => db.delete(rubros).where(and(eq(rubros.id, rubroId))).returning(),
		"deleteRubroDB"
	)
}
