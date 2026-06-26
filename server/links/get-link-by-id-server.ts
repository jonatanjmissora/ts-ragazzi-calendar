import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getLinkByIdDB } from "db/links/get-link-by-id-db"
import { linkIdValidator } from "db/links/link-validator"

export const getLinkByIdServer = createServerFn({ method: "GET" })
	.inputValidator(linkIdValidator)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)
			return await getLinkByIdDB(data.id)
		} catch {
			return null
		}
	})
