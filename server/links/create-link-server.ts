import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { createLinkDB } from "db/links/create-link-db"
import { linkFormValidator } from "db/links/link-validator"

export const createLinkServer = createServerFn({ method: "POST" })
	.inputValidator(linkFormValidator)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)

			const newLink = {
				...data,
				id: crypto.randomUUID(),
			}

			const result = await createLinkDB(newLink)
			if (!result) throw new Error("No se pudo crear el link")
			return result[0]
		} catch {
			throw new Error("No se pudo crear el link")
		}
	})
