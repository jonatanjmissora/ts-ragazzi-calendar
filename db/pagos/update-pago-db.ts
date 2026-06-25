import { pagos } from "./schema"
import { and, eq } from "drizzle-orm"
import { db } from "db/drizzle"
import { dbOp } from "db/db-error-handler"
import { UpdatePagoType } from "./pago-validator"

export async function updatePagoDB(updatedItem: UpdatePagoType) {
	return dbOp(
		async () => {
			const result = await db
				.update(pagos)
				.set({
					periodo: updatedItem.periodo,
					rubro: updatedItem.rubro,
					sector: updatedItem.sector,
					monto: updatedItem.monto,
					pagado: updatedItem.pagado,
				})
				.where(and(eq(pagos.id, updatedItem.id)))
				.returning({
					id: pagos.id,
					periodo: pagos.periodo,
					rubro: pagos.rubro,
					sector: pagos.sector,
					monto: pagos.monto,
					pagado: pagos.pagado,
				})
			return result[0]
		},
		"updatePagoDB"
	)
}
