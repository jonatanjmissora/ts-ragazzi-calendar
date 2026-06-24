export const queryKeys = {
	pagos: {
		all: ["pagos"] as const,
		byId: (id: string) => ["pagos", id] as const,
		byPeriodo: (start: number, end: number) =>
			["pagos-by-periodo", start, end] as const,
		bySector: (sector: string) => ["pagos-by-sector", sector] as const,
	},
	rubros: {
		all: ["rubros"] as const,
		byId: (id: string) => ["rubros", id] as const,
	},
}
