import { pgTable, text } from "drizzle-orm/pg-core"

export const links = pgTable("links", {
	id: text("id").primaryKey(),
	nombre: text("nombre").notNull(),
	url: text("url").notNull(),
	imagen: text("imagen").notNull().default(""),
})

export type LinkType = typeof links.$inferSelect
