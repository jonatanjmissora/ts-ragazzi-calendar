import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getPagosDB } from "db/pagos/get-pagos-db"

export const getPagosServer = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const request = getRequest()
		await protectedServerFn(request)

		return await getPagosDB()
	} catch (error) {
		console.error("ERROR en getPagosServer:", error instanceof Error ? error.message : error)
		return []
	}
})
