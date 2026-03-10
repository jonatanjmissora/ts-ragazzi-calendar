import { redirect } from "@tanstack/react-router"
import { getSession } from "server/get-session"

export async function authRoute() {
	const session = await getSession()

	if (session) {
		throw redirect({ to: "/" })
	}

	return session
}
