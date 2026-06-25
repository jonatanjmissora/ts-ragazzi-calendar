import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { deletePagoDB } from "db/pagos/delete-pago-db"
import { pagoIdValidator } from "db/pagos/pago-validator"

export const deletePagoServer = createServerFn({ method: "POST" })
	.inputValidator(pagoIdValidator)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)
			const result = await deletePagoDB(data.id)
			if (!result) throw new Error("No se pudo eliminar el pago")
			return result[0]
		} catch {
			throw new Error("No se pudo eliminar el pago")
		}
	})
