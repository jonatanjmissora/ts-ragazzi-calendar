import { dbOp } from "db/db-error-handler"
import { db } from "db/drizzle"
import { pagos } from "db/schema"
import { desc, and, gte, lte, eq, count, type SQL } from "drizzle-orm"

export type PagosFilter = {
	periodoDesde?: string
	periodoHasta?: string
	rubro?: string
	sector?: string
}

function buildConditions(filter: PagosFilter) {
	const conditions: SQL[] = []
	if (filter.periodoDesde)
		conditions.push(gte(pagos.periodo, Number(filter.periodoDesde)))
	if (filter.periodoHasta)
		conditions.push(lte(pagos.periodo, Number(filter.periodoHasta)))
	if (filter.rubro) conditions.push(eq(pagos.rubro, filter.rubro))
	if (filter.sector) conditions.push(eq(pagos.sector, filter.sector))
	return conditions
}

export async function getPagosDB(
	filter: PagosFilter = {},
	limit = 50,
	offset = 0
) {
	const conditions = buildConditions(filter)
	return dbOp(
		() =>
			db
				.select()
				.from(pagos)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(pagos.periodo))
				.limit(limit)
				.offset(offset),
		"getPagosDB"
	)
}

export async function countPagosDB(filter: PagosFilter = {}) {
	const conditions = buildConditions(filter)
	const [result] = await dbOp(
		() =>
			db
				.select({ total: count() })
				.from(pagos)
				.where(conditions.length > 0 ? and(...conditions) : undefined),
		"countPagosDB"
	)
	return result?.total ?? 0
}
