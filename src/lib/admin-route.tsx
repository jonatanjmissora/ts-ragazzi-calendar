import { redirect } from "@tanstack/react-router"
import { getSession } from "server/get-session"

export async function adminRoute() {
	const session = await getSession()

	if (!session || session.user.name !== "kato") {
		throw redirect({ to: "/" })
	}

	return session
}
