import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { createRubroDB } from "db/rubros/create-rubro-db"
import { rubroFormValidator } from "db/rubros/rubro-validator"

export const createRubroServer = createServerFn({ method: "POST" })
	.inputValidator(rubroFormValidator)
	.handler(async ({ data }) => {
		const request = getRequest()
		await protectedServerFn(request)

		const newRubro = {
			...data,
			id: crypto.randomUUID(),
		}

		const result = await createRubroDB(newRubro)
		return result[0]
	})
