import { dbOp } from "db/db-error-handler"
import { pagos, PagoType } from "./schema"
import { db } from "db/drizzle"

export async function createPagoDB(newPago: PagoType) {
	return dbOp(
		() => db.insert(pagos).values(newPago).returning(),
		"createPagoDB"
	)
}
