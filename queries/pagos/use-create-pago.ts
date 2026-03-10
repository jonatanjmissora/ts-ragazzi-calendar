import { createItemServer } from "server/items/create-item-server"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ItemFormType } from "db/items/items-validator"
import { CategoryType } from "db/categories/schema"
import { ItemType, ItemWithCategoryType } from "db/items/schema"
import { setItemForQuery, sortByDate } from "lib/utils"
import { PagoFormType } from "db/pagos/pago-validator"

type CreatePagoVariables = {
	data: PagoFormType
}

export function useCreatePago() {
	const queryClient = useQueryClient()

	return useMutation<ItemType, Error, CreatePagoVariables>({
		mutationFn: createPagoServer,
		onSuccess: async (data) => {
			queryClient.setQueryData<PagoFormType[]>(["pagos"], oldPagos => {
				if (!oldPagos) return oldPagos
				const newPagos = sortByDate([data, ...oldPagos])
				return newPagos
			})
		},
	})
}


const createPagoServer = async (data: PagoFormType) => {
	return null
}