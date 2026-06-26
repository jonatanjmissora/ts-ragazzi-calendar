import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getLinksDB } from "db/links/get-links-db"

export const getLinksServer = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const request = getRequest()
			await protectedServerFn(request)

			return await getLinksDB()
		} catch {
			return []
		}
	}
)
