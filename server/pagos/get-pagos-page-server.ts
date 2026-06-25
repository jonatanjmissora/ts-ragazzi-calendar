import { protectedServerFn } from "@/lib/protected-serverFn"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import {
	getPagosDB,
	countPagosDB,
	type PagosFilter,
} from "db/pagos/get-pagos-db"

export const getPagosPageServer = createServerFn({ method: "GET" })
	.inputValidator(
		(d: {
			page?: number
			pageSize?: number
			periodoDesde?: string
			periodoHasta?: string
			rubro?: string
			sector?: string
		}) => d
	)
	.handler(async ({ data }) => {
		try {
			const request = getRequest()
			await protectedServerFn(request)

			const page = data.page ?? 1
			const pageSize = data.pageSize ?? 50
			const offset = (page - 1) * pageSize

			const filter: PagosFilter = {
				periodoDesde: data.periodoDesde,
				periodoHasta: data.periodoHasta,
				rubro: data.rubro,
				sector: data.sector,
			}

			const [items, total] = await Promise.all([
				getPagosDB(filter, pageSize, offset),
				countPagosDB(filter),
			])

			return { items, total }
		} catch {
			return { items: [], total: 0 }
		}
	})
