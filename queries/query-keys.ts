import type { PagosFilter } from "db/pagos/get-pagos-db"

export const queryKeys = {
	pagos: {
		all: ["pagos"] as const,
		byId: (id: string) => ["pagos", id] as const,
		byPeriodo: (start: number, end: number) =>
			["pagos-by-periodo", start, end] as const,
		bySector: (sector: string, rubro: string) =>
			["pagos-by-sector", sector, rubro] as const,
		byPage: (page: number, pageSize: number, filter: PagosFilter) =>
			["pagos", "page", page, pageSize, filter] as const,
	},
	rubros: {
		all: ["rubros"] as const,
		byId: (id: string) => ["rubros", id] as const,
	},
}
