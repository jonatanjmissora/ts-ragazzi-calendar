import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { links } from "db/schema"
import { eq } from "drizzle-orm"

export async function getLinkByIdDB(itemId: string) {
	return dbOp(async () => {
		const result = await db.select().from(links).where(eq(links.id, itemId))
		return result[0]
	}, "getLinkByIdDB")
}
