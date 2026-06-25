import { and, eq } from "drizzle-orm"
import { db } from "db/drizzle"
import { dbOp } from "db/db-error-handler"
import { UpdateRubroType } from "./rubro-validator"
import { rubros } from "db/schema"

export async function updateRubroDB(updatedItem: UpdateRubroType) {
	return dbOp(
		async () => {
			const result = await db
				.update(rubros)
				.set({
					nombre: updatedItem.nombre,
					sectores: updatedItem.sectores,
				})
				.where(and(eq(rubros.id, updatedItem.id)))
				.returning({
					id: rubros.id,
					nombre: rubros.nombre,
					sectores: rubros.sectores,
				})
			return result[0]
		},
		"updateRubroDB"
	)
}
