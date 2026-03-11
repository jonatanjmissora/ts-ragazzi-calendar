import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { createPagoDB } from "db/pagos/create-pago-db"
import { pagoFormValidator } from "db/pagos/pago-validator"

export const createPagoServer = createServerFn({ method: "POST" })
	.inputValidator(pagoFormValidator)
	.handler(async ({ data }) => {
		const request = getRequest()
		await protectedServerFn(request)

		const newPago = {
			...data,
			id: crypto.randomUUID(),
		}

		const result = await createPagoDB(newPago)
		return result[0]
	})
