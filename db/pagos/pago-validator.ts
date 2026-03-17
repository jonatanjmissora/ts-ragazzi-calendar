import { z } from "zod"

export const pagoFormValidator = z.object({
	periodo: z
		.number()
		.min(20260000, "El periodo debe ser mayor o igual a 20260000")
		.max(20500000, "El periodo no puede exceder el año 2050"),

	rubro: z.string().min(1, "El rubro es requerido"),

	sector: z.string().min(1, "El sector es requerido"),

	monto: z.number().catch(0),

	pagado: z.number().catch(0),
})

export type PagoFormType = z.infer<typeof pagoFormValidator>

export const pagoIdValidator = z.object({
	id: z.string().uuid("ID inválido"),
})

export const updatePagoValidator = pagoFormValidator.extend({
	id: z.string().min(1, "Id requerido"),
})

export type UpdatePagoType = z.infer<typeof updatePagoValidator>
