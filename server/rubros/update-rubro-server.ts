import { getRequest } from "@tanstack/react-start/server"
import { createServerFn } from "@tanstack/react-start"
import { updateRubroValidator } from "db/rubros/rubro-validator"
import { protectedServerFn } from "@/lib/protected-serverFn"
import { updateRubroDB } from "db/rubros/update-rubro-db"

export const updateRubroServer = createServerFn({ method: "POST" })
	.inputValidator(updateRubroValidator)
	.handler(async ({ data }) => {
		const request = getRequest()
		await protectedServerFn(request)

		return await updateRubroDB(data)
	})
