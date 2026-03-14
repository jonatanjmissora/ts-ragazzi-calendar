import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getRubroByIdDB } from "db/rubros/get-rubro-by-id-db"
import { rubroIdValidator } from "db/rubros/rubro-validator"

export const getRubroByIdServer = createServerFn()
	.inputValidator(rubroIdValidator)
	.handler(async ({ data }) => {
		const request = getRequest()
		await protectedServerFn(request)
		const itemId = data.id
		return await getRubroByIdDB(itemId)
	})
