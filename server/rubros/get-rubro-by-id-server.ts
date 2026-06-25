import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getRubroByIdDB } from "db/rubros/get-rubro-by-id-db"
import { rubroIdValidator } from "db/rubros/rubro-validator"

export const getRubroByIdServer = createServerFn({ method: "GET" })
	.inputValidator(rubroIdValidator)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)
			return await getRubroByIdDB(data.id)
		} catch {
			return null
		}
	})
