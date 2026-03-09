import { auth } from "@/lib/auth"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const request = getRequest()
		return await auth.api.getSession({
			headers: request.headers,
		})
	}
)
