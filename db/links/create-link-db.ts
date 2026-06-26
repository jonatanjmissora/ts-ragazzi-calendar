import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { links, LinkType } from "db/schema"

export async function createLinkDB(newLink: LinkType) {
	return dbOp(
		() => db.insert(links).values(newLink).returning(),
		"createLinkDB"
	)
}
