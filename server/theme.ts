import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import z from "zod"

const storageKey = "app-theme"
const setThemeValidator = z.enum(["light", "dark", "auto"])

export const getThemeServerFn = createServerFn({ method: "GET" }).handler(() => {
	const theme = getCookie(storageKey)
	return theme ? setThemeValidator.parse(theme) : "auto"
})

export const setThemeServerFn = createServerFn({ method: "POST" })
	.inputValidator(setThemeValidator)
	.handler(({ data }) => {
		setCookie(storageKey, data, {
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		})
	})
