import { getRequest } from "@tanstack/react-start/server"
import { createServerFn } from "@tanstack/react-start"
import { updatePagoValidator } from "db/pagos/pago-validator"
import { protectedServerFn } from "@/lib/protected-serverFn"
import { updatePagoDB } from "db/pagos/update-pago-db"

export const updatePagoServer = createServerFn({ method: "POST" })
	.inputValidator(updatePagoValidator)
	.handler(async ({ data }) => {
		const request = getRequest()
		await protectedServerFn(request)

		return await updatePagoDB(data)
	})
