import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { desc } from "drizzle-orm"

export async function getPagosDB() {
	return dbOp(
		() => db.select().from(pagos).orderBy(desc(pagos.periodo)),
		"getPagosDB"
	)
}
