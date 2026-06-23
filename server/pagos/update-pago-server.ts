import { getRequest } from "@tanstack/react-start/server"
import { createServerFn } from "@tanstack/react-start"
import { updatePagoValidator } from "db/pagos/pago-validator"
import { protectedServerFn } from "@/lib/protected-serverFn"
import { updatePagoDB } from "db/pagos/update-pago-db"

export const updatePagoServer = createServerFn({ method: "POST" })
	.inputValidator(updatePagoValidator)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)

			return await updatePagoDB(data)
		} catch (error) {
			console.error("ERROR en updatePagoServer:", error instanceof Error ? error.message : error)
			throw new Error("No se pudo actualizar el pago")
		}
	})
