import { and, eq } from "drizzle-orm"
import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { UpdateRubroType } from "./rubro-validator"
import { rubros } from "db/pagos/schema"

export async function updateRubroDB(updatedItem: UpdateRubroType) {
	try {
		await delay()
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
	} catch (error) {
		console.error(
			"ERROR actualizando rubro:",
			error instanceof Error ? error.message : error
		)
	}
}
