import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { linkIdValidator } from "db/links/link-validator"
import { deleteLinkDB } from "db/links/delete-link-db"

export const deleteLinkServer = createServerFn({ method: "POST" })
	.inputValidator(linkIdValidator)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)

			const result = await deleteLinkDB(data.id)
			if (!result) throw new Error("No se pudo eliminar el link")
			return result[0]
		} catch {
			throw new Error("No se pudo eliminar el link")
		}
	})
