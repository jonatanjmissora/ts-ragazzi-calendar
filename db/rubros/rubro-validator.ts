import { z } from "zod"

export const rubroFormValidator = z.object({
	nombre: z.string().min(1, "El nombre es requerido"),

	sectores: z.string().min(1, "Debe seleccionar al menos un sector"),
})

export type RubroFormType = z.infer<typeof rubroFormValidator>

export const rubroIdValidator = z.object({
	id: z.string().uuid("ID inválido"),
})

export const updateRubroValidator = rubroFormValidator.extend({
	id: z.string().min(1, "Id requerido"),
})

export type UpdateRubroType = z.infer<typeof updateRubroValidator>
