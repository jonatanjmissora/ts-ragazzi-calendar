import { pagos } from "./schema"
import { and, eq } from "drizzle-orm"
import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { UpdatePagoType } from "./pago-validator"

export async function updatePagoDB(updatedItem: UpdatePagoType) {
	try {
		await delay()
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
	} catch (error) {
		console.error(
			"ERROR actualizando pago:",
			error instanceof Error ? error.message : error
		)
	}
}
