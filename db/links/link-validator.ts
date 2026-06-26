import { z } from "zod"

export const linkFormValidator = z.object({
	nombre: z.string().min(1, "El nombre es requerido"),
	url: z.string().url("Debe ser una URL válida"),
	imagen: z.string(),
})

export type LinkFormType = z.infer<typeof linkFormValidator>

export const linkIdValidator = z.object({
	id: z.string().uuid("ID inválido"),
})

export const updateLinkValidator = linkFormValidator.extend({
	id: z.string().min(1, "Id requerido"),
})

export type UpdateLinkType = z.infer<typeof updateLinkValidator>
