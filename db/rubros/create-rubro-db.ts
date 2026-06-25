import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { rubros, RubroType } from "db/schema"

export async function createRubroDB(newRubro: RubroType) {
	return dbOp(
		() => db.insert(rubros).values(newRubro).returning(),
		"createRubroDB"
	)
}
