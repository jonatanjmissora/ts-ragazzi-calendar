import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getPagosDB } from "db/pagos/get-pagos-db"

export const getPagosServer = createServerFn().handler(async () => {
	const request = getRequest()
	await protectedServerFn(request)

	return await getPagosDB()
})
