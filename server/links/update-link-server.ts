import { getRequest } from "@tanstack/react-start/server"
import { createServerFn } from "@tanstack/react-start"
import { updateLinkValidator } from "db/links/link-validator"
import { protectedServerFn } from "@/lib/protected-serverFn"
import { updateLinkDB } from "db/links/update-link-db"

export const updateLinkServer = createServerFn({ method: "POST" })
	.inputValidator(updateLinkValidator)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)

			return await updateLinkDB(data)
		} catch {
			throw new Error("No se pudo actualizar el link")
		}
	})
