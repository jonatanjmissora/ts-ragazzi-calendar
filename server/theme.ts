import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import z from "zod"

const storageKey = "app-theme"
const setThemeValidator = z.enum(["light", "dark", "auto"])

export const getThemeServerFn = createServerFn().handler(() => {
	const theme = getCookie(storageKey)
	return theme ? setThemeValidator.parse(theme) : "auto"
})

export const setThemeServerFn = createServerFn()
	.inputValidator(setThemeValidator)
	.handler(({ data }) => {
		setCookie(storageKey, data)
	})
