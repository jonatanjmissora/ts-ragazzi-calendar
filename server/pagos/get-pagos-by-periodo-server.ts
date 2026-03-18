import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getPagosByPeriodoDB } from "db/pagos/get-pagos-by-periodo-db"

export const getPagosByPeriodoServer = createServerFn().handler(async () => {
	const request = getRequest()
	await protectedServerFn(request)

	return await getPagosByPeriodoDB()
})
