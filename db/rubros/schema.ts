import { pgTable, text } from "drizzle-orm/pg-core"

export const rubros = pgTable("rubros", {
	id: text("id").primaryKey(),

	nombre: text("nombre").notNull(),

	sectores: text("sectores").notNull(),
})

export type RubroType = typeof rubros.$inferSelect
