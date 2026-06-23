import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getRubrosDB } from "db/rubros/get-rubros-db"

export const getRubrosServer = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const request = getRequest()
		await protectedServerFn(request)

		return await getRubrosDB()
	} catch (error) {
		console.error("ERROR en getRubrosServer:", error instanceof Error ? error.message : error)
		return []
	}
})
