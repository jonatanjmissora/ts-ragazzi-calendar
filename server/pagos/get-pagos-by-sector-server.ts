import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getPagosBySectorDB } from "db/pagos/get-pagos-by-sector-db"

export const getPagosBySectorServer = createServerFn({ method: "GET" })
	.inputValidator((data: { sector: string; rubro: string }) => data)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)
			return await getPagosBySectorDB(data)
		} catch {
			return []
		}
	})
