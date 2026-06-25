import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getPagosByPeriodoDB } from "db/pagos/get-pagos-by-periodo-db"

export const getPagosByPeriodoServer = createServerFn({ method: "GET" })
	.inputValidator((data: { start: number; end: number }) => data)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)
			return await getPagosByPeriodoDB(data.start, data.end)
		} catch {
			return []
		}
	})
