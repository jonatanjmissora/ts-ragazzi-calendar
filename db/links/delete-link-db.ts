import { links } from "db/schema"
import { and, eq } from "drizzle-orm"
import { db } from "db/drizzle"
import { dbOp } from "db/db-error-handler"

export async function deleteLinkDB(linkId: string) {
	return dbOp(
		() =>
			db
				.delete(links)
				.where(and(eq(links.id, linkId)))
				.returning(),
		"deleteLinkDB"
	)
}
