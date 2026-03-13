import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { getPagoByIdDB } from "db/pagos/get-pago-by-id-db"
import { pagoIdValidator } from "db/pagos/pago-validator"

export const getPagoByIdServer = createServerFn()
	.inputValidator(pagoIdValidator)
	.handler(async ({ data }) => {
		const request = getRequest()
		await protectedServerFn(request)
		const itemId = data.id
		return await getPagoByIdDB(itemId)
	})
