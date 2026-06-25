import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { eq } from "drizzle-orm"

export async function getPagoByIdDB(itemId: string) {
	return dbOp(
		async () => {
			const result = await db.select().from(pagos).where(eq(pagos.id, itemId))
			return result[0]
		},
		"getPagoByIdDB"
	)
}
