import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { rubros } from "db/schema"
import { desc } from "drizzle-orm"

export async function getRubrosDB() {
	return dbOp(
		() => db.select().from(rubros).orderBy(desc(rubros.nombre)),
		"getRubrosDB"
	)
}
