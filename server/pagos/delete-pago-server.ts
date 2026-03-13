import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { deletePagoDB } from "db/pagos/delete-pago-db"
import { pagoIdValidator } from "db/pagos/pago-validator"

export const deletePagoServer = createServerFn({ method: "POST" })
	.inputValidator(pagoIdValidator)
	.handler(async ({ data }) => {
		const request = getRequest()
		const session = await protectedServerFn(request)

		const result = await deletePagoDB(data.id, session.user.id)
		return result[0]
	})
