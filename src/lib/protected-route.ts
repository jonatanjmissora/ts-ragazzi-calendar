import { redirect } from "@tanstack/react-router"
import { getSession } from "server/get-session"

export async function protectedRoute() {
	const session = await getSession()

	if (!session) {
		throw redirect({ to: "/login" })
	}

	return session
}
