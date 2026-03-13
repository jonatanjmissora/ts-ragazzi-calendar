import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { rubroIdValidator } from "db/rubros/rubro-validator"
import { deleteRubroDB } from "db/rubros/delete-rubro-db"

export const deleteRubroServer = createServerFn({ method: "POST" })
	.inputValidator(rubroIdValidator)
	.handler(async ({ data }) => {
		const request = getRequest()
		await protectedServerFn(request)

		const result = await deleteRubroDB(data.id)
		return result[0]
	})
