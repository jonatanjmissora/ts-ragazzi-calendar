import { config } from "dotenv"
import { resolve } from "path"
config({ path: [resolve(".env.local"), resolve(".env")] })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../db/schema"
import { pagos } from "../db/pagos/schema"
import { ENERO_2026, FEBRERO_2026, MARZO_2026 } from "../src/_constants"
import { randomUUID } from "node:crypto"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const batches = [
	{ name: "ENERO_2026", data: ENERO_2026 },
	{ name: "FEBRERO_2026", data: FEBRERO_2026 },
	{ name: "MARZO_2026", data: MARZO_2026 },
]

for (const { name, data } of batches) {
	const pagosToInsert = data.map(p => ({
		id: randomUUID(),
		periodo: p.periodo,
		rubro: p.rubro,
		sector: p.sector,
		monto: Number(p.monto),
		pagado: p.pagado,
	}))

	try {
		const result = await db.insert(pagos).values(pagosToInsert).returning()
		console.log(`Insertados ${result.length} pagos de ${name}`)
	} catch (error) {
		console.error(`Error al insertar ${name}:`, error instanceof Error ? error.message : error)
	}
}
