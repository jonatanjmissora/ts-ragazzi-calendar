import { config } from "dotenv"
import { resolve } from "path"
config({ path: [resolve(".env.local"), resolve(".env")] })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../db/schema"
import { pagos } from "../db/pagos/schema"
import { MAYO_2026 } from "../src/_constants"
import { randomUUID } from "node:crypto"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const pagosToInsert = MAYO_2026.map(p => ({
	id: randomUUID(),
	periodo: p.periodo,
	rubro: p.rubro,
	sector: p.sector,
	monto: Number(p.monto),
	pagado: p.pagado,
}))

try {
	const result = await db.insert(pagos).values(pagosToInsert).returning()
	console.log(`Insertados ${result.length} pagos de MAYO_2026`)
} catch (error) {
	console.error("Error al insertar pagos:", error instanceof Error ? error.message : error)
}
