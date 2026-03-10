import { pgTable, text, index, bigint, integer } from "drizzle-orm/pg-core"

export const pagos = pgTable(
	"pagos",
	{
		id: text("id").primaryKey(),

		periodo: bigint("periodo", { mode: "number" }).notNull(),

		rubro: text("rubro").notNull(),

		sector: text("sector").notNull(),

		monto: integer("monto").notNull(),

		pagado: bigint("pagado", { mode: "number" }).notNull(),
	},
	table => ({
		periodoIdx: index("pagos_periodo_idx").on(table.periodo),
	})
)

export type PagoType = typeof pagos.$inferSelect

export const rubros = pgTable("rubros", {
	id: text("id").primaryKey(),

	nombre: text("nombre").notNull(),

	sectores: text("sectores").array().notNull(),
})

export type RubroType = typeof rubros.$inferSelect
