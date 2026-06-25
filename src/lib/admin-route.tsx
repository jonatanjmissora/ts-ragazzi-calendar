import { redirect } from "@tanstack/react-router"
import { getSession } from "server/get-session"

export async function adminRoute() {
	const session = await getSession()

	if (!session || session.user?.id !== "mn9ffipQ0t54YPhuJ3gaYfu5XKp0mN3y") {
		throw redirect({ to: "/" })
	}

	return session
}
