import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { countPagosDB, type PagosFilter } from "db/pagos/get-pagos-db"

export const getPagosCountServer = createServerFn({ method: "GET" })
	.inputValidator((d: PagosFilter) => d)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)
			return await countPagosDB(data)
		} catch {
			return 0
		}
	})
