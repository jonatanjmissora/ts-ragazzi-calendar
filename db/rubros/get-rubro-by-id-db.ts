import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { rubros } from "db/schema"
import { eq } from "drizzle-orm"

export async function getRubroByIdDB(itemId: string) {
	return dbOp(
		async () => {
			const result = await db.select().from(rubros).where(eq(rubros.id, itemId))
			return result[0]
		},
		"getRubroByIdDB"
	)
}
