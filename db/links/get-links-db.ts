import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { links } from "db/schema"
import { asc } from "drizzle-orm"

export async function getLinksDB() {
	return dbOp(
		() => db.select().from(links).orderBy(asc(links.nombre)),
		"getLinksDB"
	)
}
