import { and, eq } from "drizzle-orm"
import { db } from "db/drizzle"
import { dbOp } from "db/db-error-handler"
import { UpdateLinkType } from "./link-validator"
import { links } from "db/schema"

export async function updateLinkDB(updatedItem: UpdateLinkType) {
	return dbOp(async () => {
		const result = await db
			.update(links)
			.set({
				nombre: updatedItem.nombre,
				url: updatedItem.url,
				imagen: updatedItem.imagen,
			})
			.where(and(eq(links.id, updatedItem.id)))
			.returning({
				id: links.id,
				nombre: links.nombre,
				url: links.url,
				imagen: links.imagen,
			})
		return result[0]
	}, "updateLinkDB")
}
