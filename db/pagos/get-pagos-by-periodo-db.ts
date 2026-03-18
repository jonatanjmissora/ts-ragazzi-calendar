import { delay } from "@/lib/utils"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { desc, and, gte, lt } from "drizzle-orm"

const now = new Date()

const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

const format = (d: Date) =>
	Number(
		`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
	)

const start = format(startDate)
const end = format(nextMonth)

export async function getPagosByPeriodoDB() {
	try {
		await delay()
		return await db
			.select()
			.from(pagos)
			.where(
				and(
					gte(pagos.periodo, start),
					lt(pagos.periodo, end) // 👈 clave
				)
			)
			.orderBy(desc(pagos.periodo))
	} catch (error) {
		console.error(
			"ERROR obteniendo pagos:",
			error instanceof Error ? error.message : error
		)
	}
}
